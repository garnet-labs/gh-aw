import { useState, useEffect, useRef, useCallback } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { useWorkflowStore } from '../../stores/workflowStore';
import { generateMarkdown } from '../../utils/markdownGenerator';
import { compile, isCompilerReady } from '../../utils/compiler';

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

  // On mount, generate markdown from the current store state
  useEffect(() => {
    const state = useWorkflowStore.getState();
    const md = generateMarkdown(state);
    setMarkdown(md);
    setYaml(state.compiledYaml || '');
    setCompileError(state.error);
    setWarnings(state.warnings || []);
  }, []);

  // Compile markdown on changes (debounced 500ms)
  const compileMarkdown = useCallback((md: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (!isCompilerReady()) return;

      setIsCompiling(true);
      try {
        const result = await compile(md);
        setYaml(result.yaml);
        setCompileError(result.error);
        setWarnings(result.warnings);

        // Keep the store in sync
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
    }, 500);
  }, []);

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
      {/* Left pane: editable markdown */}
      <div className="editor-pane editor-pane-left">
        <div className="editor-pane-header">
          <span className="editor-pane-title">Markdown Source</span>
          {isCompiling && (
            <span className="editor-compiling-badge">Compiling...</span>
          )}
        </div>
        <textarea
          className="editor-textarea"
          value={markdown}
          onChange={handleMarkdownChange}
          spellCheck={false}
          placeholder="Write your workflow markdown here..."
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
