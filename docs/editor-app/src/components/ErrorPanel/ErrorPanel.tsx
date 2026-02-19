import { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useWorkflowStore } from '../../stores/workflowStore';

/**
 * Parse an error message into a user-friendly format.
 * Recognizes common patterns from the compiler output.
 */
function formatErrorMessage(raw: string): { label: string; detail: string } {
  if (raw.startsWith('frontmatter:')) {
    return {
      label: 'Configuration error',
      detail: raw.replace(/^frontmatter:\s*/, ''),
    };
  }
  if (raw.startsWith('yaml:')) {
    return {
      label: 'YAML formatting issue',
      detail: raw.replace(/^yaml:\s*/, ''),
    };
  }
  if (/trigger/i.test(raw)) {
    return { label: 'Error in Trigger configuration', detail: raw };
  }
  if (/engine/i.test(raw)) {
    return { label: 'Error in Engine configuration', detail: raw };
  }
  if (/permission/i.test(raw)) {
    return { label: 'Error in Permissions configuration', detail: raw };
  }
  if (/safe[_-]?output/i.test(raw)) {
    return { label: 'Error in Safe Outputs configuration', detail: raw };
  }
  if (raw.startsWith('Compiler initialization failed:')) {
    return { label: 'Compiler initialization failed', detail: raw.replace(/^Compiler initialization failed:\s*/, '') };
  }
  return { label: 'Compilation error', detail: raw };
}

const COLLAPSED_WARNING_LIMIT = 3;

export function ErrorPanel() {
  const error = useWorkflowStore((s) => s.error);
  const warnings = useWorkflowStore((s) => s.warnings);
  const isCompiling = useWorkflowStore((s) => s.isCompiling);
  const setError = useWorkflowStore((s) => s.setError);
  const setWarnings = useWorkflowStore((s) => s.setWarnings);

  const [warningsExpanded, setWarningsExpanded] = useState(false);

  // Nothing to display
  if (!error && warnings.length === 0 && !isCompiling) {
    return null;
  }

  // Determine panel variant
  const variant: 'error' | 'warning' | 'compiling' = error
    ? 'error'
    : warnings.length > 0
      ? 'warning'
      : 'compiling';

  const panelClass = `error-panel error-panel--${variant}`;

  // Compiling state
  if (variant === 'compiling') {
    return (
      <div id="error-panel" className={panelClass}>
        <div className="error-panel__header">
          <div className="error-panel__title">
            <Loader2
              size={14}
              className="error-panel__spinner"
            />
            <strong>Compiling</strong>
            <span className="error-panel__message">Building workflow...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (variant === 'error' && error) {
    const { label, detail } = formatErrorMessage(error);
    return (
      <div id="error-panel" className={panelClass}>
        <div className="error-panel__header">
          <div className="error-panel__title">
            <AlertTriangle size={14} />
            <strong>Error</strong>
            <span className="error-panel__label">{label}</span>
          </div>
          <button
            className="error-panel__dismiss"
            onClick={() => setError(null)}
            title="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
        <div className="error-panel__body monospace">
          {detail}
        </div>
      </div>
    );
  }

  // Warning state
  const showAll = warningsExpanded || warnings.length <= COLLAPSED_WARNING_LIMIT;
  const visibleWarnings = showAll ? warnings : warnings.slice(0, COLLAPSED_WARNING_LIMIT);
  const hiddenCount = warnings.length - COLLAPSED_WARNING_LIMIT;

  return (
    <div id="error-panel" className={panelClass}>
      <div className="error-panel__header">
        <div className="error-panel__title">
          <AlertCircle size={14} />
          <strong>
            {warnings.length} {warnings.length === 1 ? 'Warning' : 'Warnings'}
          </strong>
        </div>
        <button
          className="error-panel__dismiss"
          onClick={() => setWarnings([])}
          title="Dismiss warnings"
        >
          <X size={14} />
        </button>
      </div>
      <ul className="error-panel__list">
        {visibleWarnings.map((w, i) => (
          <li key={i} className="error-panel__list-item monospace">{w}</li>
        ))}
      </ul>
      {warnings.length > COLLAPSED_WARNING_LIMIT && (
        <button
          className="error-panel__expand"
          onClick={() => setWarningsExpanded(!warningsExpanded)}
        >
          {showAll ? (
            <>
              <ChevronUp size={12} />
              Show fewer
            </>
          ) : (
            <>
              <ChevronDown size={12} />
              Show {hiddenCount} more {hiddenCount === 1 ? 'warning' : 'warnings'}
            </>
          )}
        </button>
      )}
    </div>
  );
}
