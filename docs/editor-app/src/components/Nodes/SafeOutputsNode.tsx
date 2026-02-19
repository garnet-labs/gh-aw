import { memo } from 'react';
import { Send, Check } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { WorkflowNodeData } from '../../types/nodes';

const OUTPUT_LABELS: Record<string, string> = {
  'add-comment': 'Post comments',
  'create-issue': 'Create issues',
  'update-issue': 'Edit issues',
  'create-pull-request': 'Create pull requests',
  'submit-pull-request-review': 'Submit PR reviews',
  'add-labels': 'Add labels',
  'remove-labels': 'Remove labels',
  'add-reviewer': 'Request reviewers',
  'assign-to-user': 'Assign to person',
  'close-issue': 'Close issues',
  'close-pull-request': 'Close pull requests',
  'create-discussion': 'Create discussions',
  'update-release': 'Edit releases',
  'push-to-pull-request-branch': 'Push code to PR',
  'create-pull-request-review-comment': 'Review code',
  'dispatch-workflow': 'Trigger workflows',
  'upload-asset': 'Upload files',
};

interface SafeOutputsNodeProps {
  data: WorkflowNodeData;
  selected: boolean;
}

export const SafeOutputsNode = memo(function SafeOutputsNode({ data, selected }: SafeOutputsNodeProps) {
  const safeOutputs = useWorkflowStore((s) => s.safeOutputs);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const dimmed = selectedNodeId !== null && !selected;

  const enabledOutputs = Object.entries(safeOutputs).filter(([, v]) => v?.enabled);
  const count = enabledOutputs.length;

  return (
    <BaseNode
      type="safeOutputs"
      icon={<Send size={18} />}
      title={data.label}
      selected={selected}
      dimmed={dimmed}
    >
      {count > 0 ? (
        <>
          {enabledOutputs.slice(0, 4).map(([key]) => (
            <div key={key} className="workflow-node__check-item">
              <Check size={14} />
              <span>{OUTPUT_LABELS[key] || key}</span>
            </div>
          ))}
          <div className="workflow-node__summary">
            {count} action{count !== 1 ? 's' : ''} enabled
          </div>
        </>
      ) : (
        <span className="workflow-node__cta">Click to enable outputs</span>
      )}
    </BaseNode>
  );
});
