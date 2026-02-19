import {
  Bell,
  Shield,
  Bot,
  Wrench,
  FileText,
  Send,
  Globe,
  List,
  type LucideIcon,
} from 'lucide-react';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { WorkflowNodeType } from '../../types/nodes';

interface PaletteItem {
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  category: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'trigger', label: 'Trigger', description: 'When to run this workflow', icon: Bell, color: '#1a7f37', category: 'Triggers' },
  { type: 'permissions', label: 'Permissions', description: 'Access control for the agent', icon: Shield, color: '#bf8700', category: 'Configuration' },
  { type: 'engine', label: 'AI Assistant', description: 'Choose which AI to use', icon: Bot, color: '#0969da', category: 'Agent' },
  { type: 'tools', label: 'Tools', description: 'Capabilities for the agent', icon: Wrench, color: '#8250df', category: 'Agent' },
  { type: 'instructions', label: 'Instructions', description: 'Tell the agent what to do', icon: FileText, color: '#57606a', category: 'Agent' },
  { type: 'safeOutputs', label: 'Safe Outputs', description: 'Actions the agent can take', icon: Send, color: '#0e8a16', category: 'Outputs' },
  { type: 'network', label: 'Network', description: 'Internet access control', icon: Globe, color: '#cf222e', category: 'Advanced' },
  { type: 'steps', label: 'Custom Steps', description: 'Pre/post agent steps', icon: List, color: '#0550ae', category: 'Advanced' },
];

const CATEGORIES = ['Triggers', 'Configuration', 'Agent', 'Outputs', 'Advanced'];

const CATEGORY_COLORS: Record<string, string> = {
  Triggers: '#1a7f37',
  Configuration: '#bf8700',
  Agent: '#8250df',
  Outputs: '#0e8a16',
  Advanced: '#57606a',
};

export function NodePalette() {
  const selectNode = useWorkflowStore((s) => s.selectNode);

  const handleClick = (type: WorkflowNodeType) => {
    selectNode(type);
  };

  return (
    <div style={{ padding: '12px 0' }}>
      {CATEGORIES.map((category) => {
        const items = PALETTE_ITEMS.filter((item) => item.category === category);
        if (items.length === 0) return null;

        return (
          <div key={category} style={{ marginBottom: 16 }}>
            <div style={{
              padding: '4px 16px 6px',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase' as const,
              letterSpacing: 0.5,
              color: CATEGORY_COLORS[category] || 'var(--fgColor-muted, #656d76)',
            }}>
              {category}
            </div>
            {items.map((item) => (
              <PaletteItemRow
                key={item.type}
                item={item}
                onClick={() => handleClick(item.type)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function PaletteItemRow({
  item,
  onClick,
}: {
  item: PaletteItem;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '8px 16px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        textAlign: 'left' as const,
        borderRadius: 0,
        color: 'var(--fgColor-default, #1f2328)',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = 'var(--bgColor-neutral-muted, #afb8c133)')
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 6,
        background: `color-mix(in srgb, ${item.color} 12%, transparent)`,
        color: item.color,
        flexShrink: 0,
      }}>
        <Icon size={16} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</div>
        <div style={{
          fontSize: 11,
          color: 'var(--fgColor-muted, #656d76)',
          lineHeight: 1.3,
        }}>
          {item.description}
        </div>
      </div>
    </button>
  );
}
