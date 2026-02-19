import { memo } from 'react';
import { Bell } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { WorkflowNodeData } from '../../types/nodes';

const EVENT_LABELS: Record<string, string> = {
  issues: 'Issues',
  pull_request: 'Pull Request',
  issue_comment: 'Comment',
  push: 'Code Push',
  schedule: 'Schedule',
  workflow_dispatch: 'Manual Trigger',
  slash_command: 'Slash Command',
  release: 'Release',
  discussion: 'Discussion',
  pull_request_review: 'PR Review',
  pull_request_review_comment: 'PR Review Comment',
  discussion_comment: 'Discussion Comment',
};

interface TriggerNodeProps {
  data: WorkflowNodeData;
  selected: boolean;
}

export const TriggerNode = memo(function TriggerNode({ data, selected }: TriggerNodeProps) {
  const trigger = useWorkflowStore((s) => s.trigger);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const dimmed = selectedNodeId !== null && !selected;

  const eventLabel = trigger.event ? EVENT_LABELS[trigger.event] || trigger.event : '';
  const activityText = trigger.activityTypes.length > 0
    ? trigger.activityTypes.join(', ')
    : '';

  return (
    <BaseNode
      type="trigger"
      icon={<Bell size={18} />}
      title={data.label}
      selected={selected}
      dimmed={dimmed}
    >
      {trigger.event ? (
        <>
          <div>{eventLabel}</div>
          {activityText && <div>{activityText}</div>}
          {trigger.skipBots && <div>Skip bots: Yes</div>}
        </>
      ) : (
        <span className="workflow-node__cta">Click to choose a trigger</span>
      )}
    </BaseNode>
  );
});
