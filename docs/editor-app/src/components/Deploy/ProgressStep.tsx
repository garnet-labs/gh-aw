import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import { useDeployStore } from '../../stores/deployStore';

export function ProgressStep() {
  const progress = useDeployStore((s) => s.progress);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {progress.map((step) => (
        <div
          key={step.id}
          style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}
        >
          {step.status === 'done' && (
            <CheckCircle2 size={16} style={{ color: 'var(--color-success-fg, #1a7f37)', flexShrink: 0 }} />
          )}
          {step.status === 'running' && (
            <Loader2 size={16} style={{ color: 'var(--color-accent-fg, #0969da)', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
          )}
          {step.status === 'pending' && (
            <Circle size={16} style={{ color: 'var(--color-fg-muted, #656d76)', flexShrink: 0 }} />
          )}
          {step.status === 'error' && (
            <XCircle size={16} style={{ color: 'var(--color-danger-fg, #cf222e)', flexShrink: 0 }} />
          )}
          <span
            style={{
              color:
                step.status === 'done'
                  ? 'var(--color-fg-default, #1f2328)'
                  : step.status === 'running'
                    ? 'var(--color-accent-fg, #0969da)'
                    : step.status === 'error'
                      ? 'var(--color-danger-fg, #cf222e)'
                      : 'var(--color-fg-muted, #656d76)',
              fontWeight: step.status === 'running' ? 500 : 400,
            }}
          >
            {step.label}
            {step.status === 'running' && '...'}
          </span>
        </div>
      ))}
    </div>
  );
}
