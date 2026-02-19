import { memo } from 'react';
import { List } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { WorkflowNodeData } from '../../types/nodes';
import { useWorkflowStore } from '../../stores/workflowStore';

interface StepsNodeProps {
  data: WorkflowNodeData;
  selected: boolean;
}

export const StepsNode = memo(function StepsNode({ data, selected }: StepsNodeProps) {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const dimmed = selectedNodeId !== null && !selected;

  return (
    <BaseNode
      type="steps"
      icon={<List size={18} />}
      title={data.label}
      selected={selected}
      dimmed={dimmed}
    >
      <span className="workflow-node__cta">Click to add custom steps</span>
    </BaseNode>
  );
});
