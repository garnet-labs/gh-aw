import { memo } from 'react';
import { Wrench } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { WorkflowNodeData } from '../../types/nodes';

interface ToolsNodeProps {
  data: WorkflowNodeData;
  selected: boolean;
}

export const ToolsNode = memo(function ToolsNode({ data, selected }: ToolsNodeProps) {
  const tools = useWorkflowStore((s) => s.tools);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const dimmed = selectedNodeId !== null && !selected;

  return (
    <BaseNode
      type="tools"
      icon={<Wrench size={18} />}
      title={data.label}
      selected={selected}
      dimmed={dimmed}
    >
      {tools.length > 0 ? (
        <>
          <div className="workflow-node__chips">
            {tools.map((tool) => (
              <span key={tool} className="workflow-node__chip">
                {tool}
              </span>
            ))}
          </div>
          <div className="workflow-node__summary">
            {tools.length} tool{tools.length !== 1 ? 's' : ''} enabled
          </div>
        </>
      ) : (
        <span className="workflow-node__cta">Click to add tools</span>
      )}
    </BaseNode>
  );
});
