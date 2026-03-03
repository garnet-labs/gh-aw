import { CheckCircle2, ExternalLink } from 'lucide-react';
import { useDeployStore } from '../../stores/deployStore';

export function SuccessStep() {
  const prUrl = useDeployStore((s) => s.prUrl);
  const closeDialog = useDeployStore((s) => s.closeDialog);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '16px 0' }}>
      <CheckCircle2 size={40} style={{ color: 'var(--color-success-fg, #1a7f37)' }} />
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-fg-default, #1f2328)' }}>
        Pull request created successfully!
      </div>
      {prUrl && prUrl.startsWith('https://github.com/') && (
        <a
          href={prUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="pr-link"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', fontSize: 13, fontWeight: 600,
            background: 'var(--color-btn-primary-bg, #1f883d)',
            color: '#ffffff', borderRadius: 6, textDecoration: 'none',
          }}
        >
          View PR on GitHub <ExternalLink size={14} />
        </a>
      )}
      <button
        onClick={closeDialog}
        style={{
          padding: '8px 16px', fontSize: 13, fontWeight: 500,
          border: '1px solid var(--color-border-default, #d0d7de)', borderRadius: 6,
          background: 'var(--color-bg-default, #ffffff)',
          color: 'var(--color-fg-default, #1f2328)', cursor: 'pointer',
        }}
      >
        Done
      </button>
    </div>
  );
}
