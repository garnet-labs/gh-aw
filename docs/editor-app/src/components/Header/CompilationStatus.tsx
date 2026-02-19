import { useWorkflowStore } from '../../stores/workflowStore';

export function CompilationStatus() {
  const isCompiling = useWorkflowStore((s) => s.isCompiling);
  const error = useWorkflowStore((s) => s.error);
  const warnings = useWorkflowStore((s) => s.warnings);

  if (error) {
    return <span style={{ color: '#d1242f', fontSize: 12 }}>Error</span>;
  }
  if (isCompiling) {
    return <span style={{ color: '#0969da', fontSize: 12 }}>Compiling...</span>;
  }
  if (warnings.length > 0) {
    return <span style={{ color: '#9a6700', fontSize: 12 }}>{warnings.length} warning(s)</span>;
  }
  return <span style={{ color: '#1a7f37', fontSize: 12 }}>Ready</span>;
}
