import { useEffect, useRef, useCallback } from 'react';
import { X, Bold, Italic, List, ListOrdered, Heading } from 'lucide-react';
import { useWorkflowStore } from '../../stores/workflowStore';

const snippets = [
  { label: 'Be concise', text: 'Keep your responses brief and to the point.' },
  { label: 'Review code', text: 'Review the code changes for bugs, security issues, and best practices.' },
  { label: 'Create issue', text: 'Create a new issue summarizing your findings.' },
  { label: 'Add comment', text: 'Add a comment on the pull request with your analysis.' },
  { label: 'Check tests', text: 'Run the test suite and report any failures.' },
];

const PLACEHOLDER =
  'Tell the AI what to do in plain English...\n\nFor example:\n- Review the code changes for bugs\n- Create an issue summarizing findings\n- Be concise and actionable';

export function InstructionsNodeExpanded() {
  const instructions = useWorkflowStore((s) => s.instructions);
  const setInstructions = useWorkflowStore((s) => s.setInstructions);
  const setInstructionsExpanded = useWorkflowStore((s) => s.setInstructionsExpanded);
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Escape key to collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInstructionsExpanded(false);
        selectNode(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setInstructionsExpanded, selectNode]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 320) + 'px';
  }, [instructions]);

  const insertFormatting = useCallback((prefix: string, suffix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = instructions.slice(start, end);
    const replacement = prefix + selected + suffix;
    const updated = instructions.slice(0, start) + replacement + instructions.slice(end);
    setInstructions(updated);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    });
  }, [instructions, setInstructions]);

  // Keyboard shortcuts: Ctrl/Cmd+B (bold), Ctrl/Cmd+I (italic)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key === 'b') {
      e.preventDefault();
      insertFormatting('**', '**');
    } else if (mod && e.key === 'i') {
      e.preventDefault();
      insertFormatting('_', '_');
    }
  }, [insertFormatting]);

  return (
    <div className="instructions-editor nodrag nowheel nopan">
      <div className="instructions-editor__toolbar">
        <button
          className="instructions-editor__toolbar-btn"
          title="Bold (Ctrl+B)"
          onClick={() => insertFormatting('**', '**')}
        >
          <Bold size={14} />
        </button>
        <button
          className="instructions-editor__toolbar-btn"
          title="Italic (Ctrl+I)"
          onClick={() => insertFormatting('_', '_')}
        >
          <Italic size={14} />
        </button>
        <button
          className="instructions-editor__toolbar-btn"
          title="Heading"
          onClick={() => insertFormatting('## ', '')}
        >
          <Heading size={14} />
        </button>
        <button
          className="instructions-editor__toolbar-btn"
          title="Bullet list"
          onClick={() => insertFormatting('- ', '')}
        >
          <List size={14} />
        </button>
        <button
          className="instructions-editor__toolbar-btn"
          title="Numbered list"
          onClick={() => insertFormatting('1. ', '')}
        >
          <ListOrdered size={14} />
        </button>

        <button
          className="instructions-editor__close"
          title="Collapse editor (Esc)"
          onClick={() => setInstructionsExpanded(false)}
        >
          <X size={14} />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        className="instructions-editor__textarea"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={PLACEHOLDER}
      />

      <div className="instructions-editor__counter">
        {instructions.length} characters
      </div>

      <div className="instructions-editor__snippets">
        {snippets.map((s) => (
          <button
            key={s.label}
            className="instructions-editor__snippet-btn"
            onClick={() => {
              const sep = instructions.length > 0 ? '\n\n' : '';
              setInstructions(instructions + sep + s.text);
              requestAnimationFrame(() => textareaRef.current?.focus());
            }}
          >
            + {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
