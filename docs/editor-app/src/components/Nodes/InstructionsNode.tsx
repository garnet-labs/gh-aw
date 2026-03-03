import { memo, useCallback } from 'react';
import { FileText, Pencil } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { InstructionsNodeExpanded } from './InstructionsNodeExpanded';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { WorkflowNodeData } from '../../types/nodes';
import '../../styles/instructions-editor.css';

interface InstructionsNodeProps {
  data: WorkflowNodeData;
  selected: boolean;
}

export const InstructionsNode = memo(function InstructionsNode({ data, selected }: InstructionsNodeProps) {
  const instructions = useWorkflowStore((s) => s.instructions);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const instructionsExpanded = useWorkflowStore((s) => s.instructionsExpanded);
  const setInstructionsExpanded = useWorkflowStore((s) => s.setInstructionsExpanded);
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const dimmed = selectedNodeId !== null && !selected;

  const handleDoubleClick = useCallback(() => {
    setInstructionsExpanded(true);
    selectNode('instructions');
  }, [setInstructionsExpanded, selectNode]);

  const lines = instructions.split('\n').filter((l) => l.trim());
  const preview = lines.slice(0, 4).join('\n');
  const truncated = lines.length > 4;

  return (
    <div onDoubleClick={handleDoubleClick}>
      <BaseNode
        type="instructions"
        icon={<FileText size={18} />}
        title={data.label}
        selected={selected}
        dimmed={dimmed}
        expanded={instructionsExpanded}
      >
        {instructionsExpanded ? (
          <InstructionsNodeExpanded />
        ) : instructions ? (
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {preview}
            {truncated && '...'}
          </div>
        ) : (
          <span className="instructions-node__empty-cta">
            <Pencil size={14} />
            Double-click to write instructions
          </span>
        )}
      </BaseNode>
    </div>
  );
});
