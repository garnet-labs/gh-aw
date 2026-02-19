import { Workflow } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="canvas-empty-state">
      <Workflow className="canvas-empty-state__icon" size={64} />
      <h2 className="canvas-empty-state__title">Build your workflow</h2>
      <p className="canvas-empty-state__description">
        Get started by choosing a template from the sidebar, or add blocks to build your workflow step by step.
      </p>
    </div>
  );
}
