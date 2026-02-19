import { memo } from 'react';
import { FileText } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { WorkflowNodeData } from '../../types/nodes';

interface InstructionsNodeProps {
  data: WorkflowNodeData;
  selected: boolean;
}

export const InstructionsNode = memo(function InstructionsNode({ data, selected }: InstructionsNodeProps) {
  const instructions = useWorkflowStore((s) => s.instructions);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const dimmed = selectedNodeId !== null && !selected;

  const lines = instructions.split('\n').filter((l) => l.trim());
  const preview = lines.slice(0, 3).join('\n');
  const truncated = lines.length > 3;

  return (
    <BaseNode
      type="instructions"
      icon={<FileText size={18} />}
      title={data.label}
      selected={selected}
      dimmed={dimmed}
    >
      {instructions ? (
        <>
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {preview}
            {truncated && '...'}
          </div>
        </>
      ) : (
        <span className="workflow-node__cta">Click to write instructions</span>
      )}
    </BaseNode>
  );
});
