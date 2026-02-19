import * as Dialog from '@radix-ui/react-dialog';
import { Rocket, LayoutTemplate, X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useWorkflowStore } from '../../stores/workflowStore';
import { templates } from '../../utils/templates';
import { toast } from 'sonner';

export function WelcomeModal() {
  const setHasSeenOnboarding = useUIStore((s) => s.setHasSeenOnboarding);
  const loadTemplate = useWorkflowStore((s) => s.loadTemplate);

  const handleStartScratch = () => {
    setHasSeenOnboarding(true);
  };

  const handleBrowseTemplates = () => {
    const first = templates.find((t) => t.id !== 'blank-canvas');
    if (first) {
      loadTemplate(first);
      toast.success(`Loaded "${first.name}" template`);
    }
    setHasSeenOnboarding(true);
  };

  return (
    <Dialog.Root defaultOpen onOpenChange={(open) => !open && setHasSeenOnboarding(true)}>
      <Dialog.Portal>
        <Dialog.Overlay style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        }} />
        <Dialog.Content style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--bgColor-default, #ffffff)',
          borderRadius: 16,
          padding: 32,
          width: 480,
          maxWidth: '90vw',
          zIndex: 1001,
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
        }}>
          <Dialog.Close asChild>
            <button style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--fgColor-muted, #656d76)',
              padding: 4,
            }}>
              <X size={18} />
            </button>
          </Dialog.Close>

          <Dialog.Title style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 8,
            color: 'var(--fgColor-default, #1f2328)',
          }}>
            Welcome to the Workflow Builder!
          </Dialog.Title>

          <Dialog.Description style={{
            fontSize: 14,
            color: 'var(--fgColor-muted, #656d76)',
            marginBottom: 24,
            lineHeight: 1.5,
          }}>
            Create AI-powered GitHub workflows visually — no coding required.
          </Dialog.Description>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <OptionCard
              icon={<Rocket size={24} />}
              title="Start from scratch"
              description="Build your workflow step by step"
              onClick={handleStartScratch}
            />
            <OptionCard
              icon={<LayoutTemplate size={24} />}
              title="Browse templates"
              description="Start with a pre-built workflow and customize"
              onClick={handleBrowseTemplates}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function OptionCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: 20,
        border: '1px solid var(--borderColor-default, #d1d9e0)',
        borderRadius: 12,
        background: 'var(--bgColor-default, #ffffff)',
        cursor: 'pointer',
        textAlign: 'center' as const,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--fgColor-accent, #0969da)';
        e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, #0969da 15%, transparent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--borderColor-default, #d1d9e0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ color: 'var(--fgColor-accent, #0969da)' }}>{icon}</div>
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--fgColor-default, #1f2328)',
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 12,
        color: 'var(--fgColor-muted, #656d76)',
        lineHeight: 1.4,
      }}>
        {description}
      </div>
    </button>
  );
}
