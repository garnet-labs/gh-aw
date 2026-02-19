import { ReactFlowProvider } from '@xyflow/react';
import { WorkflowGraph } from './WorkflowGraph';

/**
 * Wraps WorkflowGraph with ReactFlowProvider.
 * This is a separate lazy-loaded module so the entire ReactFlow library
 * (~220KB) is deferred from the initial critical bundle.
 */
export default function CanvasWithProvider() {
  return (
    <ReactFlowProvider>
      <WorkflowGraph />
    </ReactFlowProvider>
  );
}
