import { memo } from 'react';
import { Shield } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { WorkflowNodeData } from '../../types/nodes';

interface PermissionsNodeProps {
  data: WorkflowNodeData;
  selected: boolean;
}

export const PermissionsNode = memo(function PermissionsNode({ data, selected }: PermissionsNodeProps) {
  const permissions = useWorkflowStore((s) => s.permissions);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const dimmed = selectedNodeId !== null && !selected;

  const entries = Object.entries(permissions).filter(([, v]) => v && v !== 'none');
  const count = entries.length;

  return (
    <BaseNode
      type="permissions"
      icon={<Shield size={18} />}
      title={data.label}
      selected={selected}
      dimmed={dimmed}
    >
      {count > 0 ? (
        <>
          {entries.slice(0, 3).map(([scope, level]) => (
            <div key={scope} className={`workflow-node__badge--${level}`}>
              {scope}: {level}
            </div>
          ))}
          <div className="workflow-node__summary">
            {count} scope{count !== 1 ? 's' : ''} configured
          </div>
        </>
      ) : (
        <span className="workflow-node__cta">Click to set permissions</span>
      )}
    </BaseNode>
  );
});
