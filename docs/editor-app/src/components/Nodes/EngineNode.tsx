import { memo } from 'react';
import { Bot } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { WorkflowNodeData } from '../../types/nodes';

const ENGINE_INFO: Record<string, { name: string; tagline: string }> = {
  claude: { name: 'Claude', tagline: 'Best for complex reasoning' },
  copilot: { name: 'GitHub Copilot', tagline: 'Great for GitHub integration' },
  codex: { name: 'OpenAI Codex', tagline: 'Good for code editing tasks' },
  custom: { name: 'Custom', tagline: 'Bring your own engine' },
};

interface EngineNodeProps {
  data: WorkflowNodeData;
  selected: boolean;
}

export const EngineNode = memo(function EngineNode({ data, selected }: EngineNodeProps) {
  const engine = useWorkflowStore((s) => s.engine);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const dimmed = selectedNodeId !== null && !selected;

  const info = engine.type ? ENGINE_INFO[engine.type] : null;

  return (
    <BaseNode
      type="engine"
      icon={<Bot size={18} />}
      title={data.label}
      selected={selected}
      dimmed={dimmed}
    >
      {info ? (
        <>
          <div style={{ fontWeight: 600 }}>{info.name}</div>
          <div>{info.tagline}</div>
        </>
      ) : (
        <span className="workflow-node__cta">Click to choose an AI</span>
      )}
    </BaseNode>
  );
});
