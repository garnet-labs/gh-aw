import {
  GitPullRequest,
  Tag,
  Book,
  ShieldCheck,
  Clock,
  Terminal,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useWorkflowStore } from '../../stores/workflowStore';
import { templates, templateCategories } from '../../utils/templates';
import type { WorkflowTemplate } from '../../types/workflow';

const ICON_MAP: Record<string, LucideIcon> = {
  'code-review': GitPullRequest,
  'git-pull-request': GitPullRequest,
  inbox: Tag,
  tag: Tag,
  book: Book,
  'shield-check': ShieldCheck,
  clock: Clock,
  terminal: Terminal,
  plus: Plus,
};

export function TemplateGallery() {
  const loadTemplate = useWorkflowStore((s) => s.loadTemplate);

  const handleSelect = (template: WorkflowTemplate) => {
    loadTemplate(template);
    toast.success(`Loaded "${template.name}" template`);
  };

  return (
    <div style={{ padding: 12 }}>
      {templateCategories.map((category) => {
        const items = templates.filter((t) => t.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} style={{ marginBottom: 16 }}>
            <div style={{
              padding: '4px 4px 6px',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase' as const,
              letterSpacing: 0.5,
              color: 'var(--fgColor-muted, #656d76)',
            }}>
              {category}
            </div>
            {items.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => handleSelect(template)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: WorkflowTemplate;
  onSelect: () => void;
}) {
  const Icon = ICON_MAP[template.icon] || Plus;

  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex',
        gap: 10,
        width: '100%',
        padding: 10,
        marginBottom: 4,
        border: '1px solid var(--borderColor-default, #d1d9e0)',
        borderRadius: 8,
        background: 'var(--bgColor-default, #ffffff)',
        cursor: 'pointer',
        textAlign: 'left' as const,
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)')
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 8,
        background: 'var(--bgColor-neutral-muted, #afb8c133)',
        color: 'var(--fgColor-muted, #656d76)',
        flexShrink: 0,
      }}>
        <Icon size={16} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--fgColor-default, #1f2328)',
          marginBottom: 2,
        }}>
          {template.name}
        </div>
        <div style={{
          fontSize: 11,
          color: 'var(--fgColor-muted, #656d76)',
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
        }}>
          {template.description}
        </div>
      </div>
    </button>
  );
}
