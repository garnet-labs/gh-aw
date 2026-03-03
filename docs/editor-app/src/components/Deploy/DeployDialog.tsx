import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertCircle } from 'lucide-react';
import { useDeployStore } from '../../stores/deployStore';
import { TokenStep } from './TokenStep';
import { RepoStep } from './RepoStep';
import { ProgressStep } from './ProgressStep';
import { SuccessStep } from './SuccessStep';

const STEP_TITLES: Record<string, string> = {
  auth: 'Deploy to GitHub',
  repo: 'Deploy to GitHub',
  deploying: 'Deploying...',
  success: 'Deployed!',
  error: 'Deploy Failed',
};

export function DeployDialog() {
  const isOpen = useDeployStore((s) => s.isOpen);
  const step = useDeployStore((s) => s.step);
  const error = useDeployStore((s) => s.error);
  const closeDialog = useDeployStore((s) => s.closeDialog);
  const isDeploying = useDeployStore((s) => s.isDeploying);
  const setStep = useDeployStore((s) => s.setStep);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (isDeploying) {
        if (window.confirm('Deploy is in progress. Closing will cancel the remaining steps. Already-uploaded files will remain on GitHub.')) {
          closeDialog();
        }
      } else {
        closeDialog();
      }
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={overlayStyle} />
        <Dialog.Content style={contentStyle} data-testid="deploy-dialog">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Dialog.Title style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-fg-default, #1f2328)', margin: 0 }}>
              {STEP_TITLES[step] || 'Deploy to GitHub'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-fg-muted, #656d76)' }} aria-label="Close">
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          {/* Step content */}
          {step === 'auth' && <TokenStep />}
          {step === 'repo' && <RepoStep />}
          {step === 'deploying' && <ProgressStep />}
          {step === 'success' && <SuccessStep />}
          {step === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ProgressStep />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 6, background: 'color-mix(in srgb, var(--color-danger-fg, #cf222e) 8%, transparent)' }}>
                <AlertCircle size={16} style={{ color: 'var(--color-danger-fg, #cf222e)', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: 'var(--color-danger-fg, #cf222e)' }} data-testid="deploy-error">
                  {error}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={closeDialog} style={secondaryBtnStyle}>Close</button>
                <button onClick={() => setStep('repo')} style={primaryBtnStyle}>Try Again</button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0, 0, 0, 0.4)',
  zIndex: 1000,
};

const contentStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'min(480px, 90vw)',
  maxHeight: '85vh',
  overflow: 'auto',
  padding: 24,
  borderRadius: 12,
  background: 'var(--color-bg-default, #ffffff)',
  border: '1px solid var(--color-border-default, #d0d7de)',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  zIndex: 1001,
};

const primaryBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', fontSize: 13, fontWeight: 600,
  border: 'none', borderRadius: 6, cursor: 'pointer',
  background: 'var(--color-btn-primary-bg, #1f883d)',
  color: '#ffffff',
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: '8px 16px', fontSize: 13, fontWeight: 500,
  border: '1px solid var(--color-border-default, #d0d7de)', borderRadius: 6,
  background: 'var(--color-bg-default, #ffffff)',
  color: 'var(--color-fg-default, #1f2328)', cursor: 'pointer',
};
