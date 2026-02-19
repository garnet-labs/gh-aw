import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { useWorkflowStore } from '../../stores/workflowStore';
import { generateMarkdown } from '../../utils/markdownGenerator';
import { compile, isCompilerReady } from '../../utils/compiler';

/* ── Markdown tokenizer ──
 * Parses markdown text into spans with type annotations for syntax highlighting.
 * Handles: frontmatter delimiters, YAML keys/values inside frontmatter, headings,
 * lists, bold, italic, inline code, code fences, comments, and links.
 */
type TokenType =
  | 'plain'
  | 'frontmatter-delimiter'
  | 'frontmatter-key'
  | 'frontmatter-colon'
  | 'frontmatter-value'
  | 'heading-marker'
  | 'heading-text'
  | 'list-marker'
  | 'bold'
  | 'italic'
  | 'inline-code'
  | 'code-fence'
  | 'comment'
  | 'link-bracket'
  | 'link-text'
  | 'link-paren'
  | 'link-url';

interface MdToken {
  type: TokenType;
  content: string;
}

/** Tokenize inline markdown elements within a string (bold, italic, code, links). */
function tokenizeInline(text: string): MdToken[] {
  const tokens: MdToken[] = [];
  // Regex matches: inline code, bold (**), italic (*), or markdown links [text](url)
  const inlineRe = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]*\]\([^)]*\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'plain', content: text.slice(lastIndex, match.index) });
    }
    const m = match[0];
    if (match[1]) {
      // Inline code
      tokens.push({ type: 'inline-code', content: m });
    } else if (match[2]) {
      // Bold
      tokens.push({ type: 'bold', content: m });
    } else if (match[3]) {
      // Italic
      tokens.push({ type: 'italic', content: m });
    } else if (match[4]) {
      // Link [text](url)
      const bracketEnd = m.indexOf(']');
      tokens.push({ type: 'link-bracket', content: '[' });
      tokens.push({ type: 'link-text', content: m.slice(1, bracketEnd) });
      tokens.push({ type: 'link-bracket', content: ']' });
      tokens.push({ type: 'link-paren', content: '(' });
      tokens.push({ type: 'link-url', content: m.slice(bracketEnd + 2, m.length - 1) });
      tokens.push({ type: 'link-paren', content: ')' });
    }
    lastIndex = match.index + m.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'plain', content: text.slice(lastIndex) });
  }
  return tokens;
}

/** Full-line tokenizer: returns an array of token arrays, one per line. */
function tokenizeMarkdown(source: string): MdToken[][] {
  const lines = source.split('\n');
  const result: MdToken[][] = [];
  let inFrontmatter = false;
  let frontmatterCount = 0; // how many --- delimiters we've seen
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trimEnd();

    // Detect frontmatter delimiters (must be exactly "---" at the start)
    if (!inCodeBlock && /^---\s*$/.test(trimmed)) {
      if (!inFrontmatter && frontmatterCount === 0) {
        // Opening delimiter
        inFrontmatter = true;
        frontmatterCount = 1;
        result.push([{ type: 'frontmatter-delimiter', content: line }]);
        continue;
      } else if (inFrontmatter && frontmatterCount === 1) {
        // Closing delimiter
        inFrontmatter = false;
        frontmatterCount = 2;
        result.push([{ type: 'frontmatter-delimiter', content: line }]);
        continue;
      }
    }

    // Inside frontmatter: highlight YAML keys and values
    if (inFrontmatter) {
      const keyMatch = line.match(/^(\s*)([\w][\w.-]*)(\s*:\s*)(.*)/);
      if (keyMatch) {
        const tokens: MdToken[] = [];
        if (keyMatch[1]) tokens.push({ type: 'plain', content: keyMatch[1] });
        tokens.push({ type: 'frontmatter-key', content: keyMatch[2] });
        tokens.push({ type: 'frontmatter-colon', content: keyMatch[3] });
        if (keyMatch[4]) tokens.push({ type: 'frontmatter-value', content: keyMatch[4] });
        result.push(tokens);
      } else if (/^\s*#/.test(line)) {
        result.push([{ type: 'comment', content: line }]);
      } else if (/^\s*-\s/.test(line)) {
        // YAML list item inside frontmatter
        const dashMatch = line.match(/^(\s*-\s)(.*)/);
        if (dashMatch) {
          result.push([
            { type: 'list-marker', content: dashMatch[1] },
            { type: 'frontmatter-value', content: dashMatch[2] },
          ]);
        } else {
          result.push([{ type: 'frontmatter-value', content: line }]);
        }
      } else {
        result.push([{ type: 'frontmatter-value', content: line }]);
      }
      continue;
    }

    // Code fence (``` or ~~~)
    if (/^(`{3,}|~{3,})/.test(trimmed)) {
      inCodeBlock = !inCodeBlock;
      result.push([{ type: 'code-fence', content: line }]);
      continue;
    }

    if (inCodeBlock) {
      result.push([{ type: 'inline-code', content: line }]);
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6}\s)(.*)/);
    if (headingMatch) {
      const tokens: MdToken[] = [
        { type: 'heading-marker', content: headingMatch[1] },
      ];
      tokens.push(...tokenizeInline(headingMatch[2]).map(t =>
        t.type === 'plain' ? { ...t, type: 'heading-text' as TokenType } : t
      ));
      result.push(tokens);
      continue;
    }

    // Unordered list items
    const listMatch = line.match(/^(\s*[-*+]\s)(.*)/);
    if (listMatch) {
      result.push([
        { type: 'list-marker', content: listMatch[1] },
        ...tokenizeInline(listMatch[2]),
      ]);
      continue;
    }

    // Ordered list items
    const orderedMatch = line.match(/^(\s*\d+\.\s)(.*)/);
    if (orderedMatch) {
      result.push([
        { type: 'list-marker', content: orderedMatch[1] },
        ...tokenizeInline(orderedMatch[2]),
      ]);
      continue;
    }

    // HTML comments
    if (/^\s*<!--/.test(trimmed)) {
      result.push([{ type: 'comment', content: line }]);
      continue;
    }

    // Default: inline tokenization
    result.push(tokenizeInline(line));
  }

  return result;
}

/** Map token types to CSS colors (GitHub-like palette). */
const tokenColors: Record<TokenType, string> = {
  'plain':                 '#1f2328',
  'frontmatter-delimiter': '#cf222e',
  'frontmatter-key':       '#0550ae',
  'frontmatter-colon':     '#1f2328',
  'frontmatter-value':     '#0a3069',
  'heading-marker':        '#cf222e',
  'heading-text':          '#1f2328',
  'list-marker':           '#cf222e',
  'bold':                  '#1f2328',
  'italic':                '#1f2328',
  'inline-code':           '#0550ae',
  'code-fence':            '#6e7781',
  'comment':               '#6e7781',
  'link-bracket':          '#1f2328',
  'link-text':             '#0969da',
  'link-paren':            '#1f2328',
  'link-url':              '#0550ae',
};

const tokenFontWeight: Partial<Record<TokenType, number>> = {
  'heading-marker': 700,
  'heading-text':   700,
  'bold':           700,
  'frontmatter-key': 600,
};

const tokenFontStyle: Partial<Record<TokenType, string>> = {
  'italic':  'italic',
  'comment': 'italic',
};

const tokenBg: Partial<Record<TokenType, string>> = {
  'inline-code': 'rgba(175,184,193,0.2)',
};

/**
 * Side-by-side editor view: editable markdown on the left, compiled YAML on the right.
 * The markdown is compiled via WASM on a 500ms debounce.
 */
export function EditorView() {
  const [markdown, setMarkdown] = useState('');
  const [yaml, setYaml] = useState('');
  const [compileError, setCompileError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markdownRef = useRef('');

  // Keep ref in sync for the isReady watcher
  markdownRef.current = markdown;

  // Direct compile helper (no debounce) for initial/on-ready compilation
  const doCompile = useCallback(async (md: string) => {
    if (!isCompilerReady() || !md.trim()) return;
    setIsCompiling(true);
    try {
      const result = await compile(md);
      setYaml(result.yaml);
      setCompileError(result.error);
      setWarnings(result.warnings);
      const s = useWorkflowStore.getState();
      s.setCompiledYaml(result.yaml);
      s.setCompiledMarkdown(md);
      s.setWarnings(result.warnings);
      s.setError(result.error);
    } catch (err) {
      setCompileError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCompiling(false);
    }
  }, []);

  // On mount, generate markdown from the current store state and compile if needed
  useEffect(() => {
    const state = useWorkflowStore.getState();
    const md = generateMarkdown(state);
    setMarkdown(md);
    setYaml(state.compiledYaml || '');
    setCompileError(state.error);
    setWarnings(state.warnings || []);
    // If we have markdown but no compiled YAML (e.g. after page reload), compile immediately
    if (md.trim() && !state.compiledYaml) {
      doCompile(md);
    }
  }, [doCompile]);

  // When the WASM compiler becomes ready, compile if we have markdown but no YAML yet
  const isReady = useWorkflowStore((s) => s.isReady);
  useEffect(() => {
    if (isReady && markdownRef.current.trim() && !yaml) {
      doCompile(markdownRef.current);
    }
  }, [isReady, doCompile, yaml]);

  // Compile markdown on changes (debounced 500ms)
  const compileMarkdown = useCallback((md: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => doCompile(md), 500);
  }, [doCompile]);

  const handleMarkdownChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setMarkdown(value);
      compileMarkdown(value);
    },
    [compileMarkdown]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="editor-view">
      {/* Left pane: editable markdown with syntax highlighting */}
      <div className="editor-pane editor-pane-left">
        <div className="editor-pane-header">
          <span className="editor-pane-title">Markdown Source</span>
          {isCompiling && (
            <span className="editor-compiling-badge">Compiling...</span>
          )}
        </div>
        <MarkdownEditor
          value={markdown}
          onChange={handleMarkdownChange}
        />
      </div>

      {/* Divider */}
      <div className="editor-divider" />

      {/* Right pane: compiled YAML */}
      <div className="editor-pane editor-pane-right">
        <div className="editor-pane-header">
          <span className="editor-pane-title">Compiled YAML</span>
          {warnings.length > 0 && (
            <span className="editor-warning-count">
              {warnings.length} warning{warnings.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="editor-warnings">
            {warnings.map((w, i) => (
              <div key={i} className="editor-warning-line">{w}</div>
            ))}
          </div>
        )}

        {/* Error */}
        {compileError && (
          <div className="editor-error">
            <strong>Error:</strong> {compileError}
          </div>
        )}

        {/* YAML output */}
        <div className="yaml-output">
          {yaml ? (
            <YamlHighlighted code={yaml} />
          ) : (
            <div className="yaml-empty-state">
              {compileError
                ? 'Fix the errors above to see compiled output.'
                : 'Edit the markdown on the left to see compiled YAML here.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Markdown Editor with syntax highlighting ──
 * Uses the "transparent textarea over highlighted pre" technique:
 *  - A <pre> renders the syntax-highlighted code underneath
 *  - A <textarea> sits on top with transparent text so the caret is visible
 *  - Both share identical font metrics so text lines up exactly
 */
function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Synchronize scroll between textarea and highlighted pre
  const handleScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Tokenize the markdown for highlighting
  const highlightedLines = useMemo(() => tokenizeMarkdown(value), [value]);

  return (
    <div className="md-editor-container">
      {/* Highlighted layer (underneath) */}
      <pre
        ref={preRef}
        className="md-editor-highlight"
        aria-hidden="true"
      >
        {highlightedLines.map((lineTokens, i) => (
          <div key={i} className="md-editor-line">
            <span className="editor-line-number">{i + 1}</span>
            <span className="md-editor-line-content">
              {lineTokens.length === 0 ? (
                // Empty line: render a newline-preserving space
                '\n'
              ) : (
                lineTokens.map((tok, j) => (
                  <span
                    key={j}
                    style={{
                      color: tokenColors[tok.type],
                      fontWeight: tokenFontWeight[tok.type],
                      fontStyle: tokenFontStyle[tok.type],
                      backgroundColor: tokenBg[tok.type],
                      borderRadius: tokenBg[tok.type] ? '3px' : undefined,
                      padding: tokenBg[tok.type] ? '0.1em 0.3em' : undefined,
                    }}
                  >
                    {tok.content}
                  </span>
                ))
              )}
            </span>
          </div>
        ))}
        {/* Trailing newline keeps scroll height in sync */}
        <div className="md-editor-line">&nbsp;</div>
      </pre>

      {/* Transparent textarea (on top, captures input) */}
      <textarea
        ref={textareaRef}
        className="md-editor-textarea"
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        spellCheck={false}
        placeholder="Write your workflow markdown here..."
      />
    </div>
  );
}

/* ── YAML Highlighted output ── */
function YamlHighlighted({ code }: { code: string }) {
  return (
    <Highlight theme={themes.github} code={code} language="yaml">
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre style={{ ...style, ...yamlPreStyle }}>
          {tokens.map((line, i) => {
            const lineProps = getLineProps({ line });
            return (
              <div key={i} {...lineProps} style={{ ...lineProps.style, display: 'flex' }}>
                <span className="editor-line-number">{i + 1}</span>
                <span style={{ flex: 1 }}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            );
          })}
        </pre>
      )}
    </Highlight>
  );
}

const yamlPreStyle: React.CSSProperties = {
  margin: 0,
  padding: '12px',
  fontSize: '13px',
  lineHeight: '1.6',
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  overflow: 'auto',
  minHeight: '100%',
  background: 'transparent',
};
