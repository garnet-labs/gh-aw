import { memo } from 'react';
import { Globe } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { WorkflowNodeData } from '../../types/nodes';

interface NetworkNodeProps {
  data: WorkflowNodeData;
  selected: boolean;
}

export const NetworkNode = memo(function NetworkNode({ data, selected }: NetworkNodeProps) {
  const network = useWorkflowStore((s) => s.network);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const dimmed = selectedNodeId !== null && !selected;

  const allowedCount = network.allowed.length;
  const blockedCount = network.blocked.length;
  const total = allowedCount + blockedCount;

  return (
    <BaseNode
      type="network"
      icon={<Globe size={18} />}
      title={data.label}
      selected={selected}
      dimmed={dimmed}
    >
      {total > 0 ? (
        <>
          {allowedCount > 0 && (
            <div>{allowedCount} allowed domain{allowedCount !== 1 ? 's' : ''}</div>
          )}
          {blockedCount > 0 && (
            <div>{blockedCount} blocked domain{blockedCount !== 1 ? 's' : ''}</div>
          )}
        </>
      ) : (
        <span className="workflow-node__cta">Click to configure network</span>
      )}
    </BaseNode>
  );
});
