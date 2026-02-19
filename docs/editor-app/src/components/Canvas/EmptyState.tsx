import { Workflow, LayoutTemplate } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import '../../styles/nodes.css';

export function EmptyState() {
  const setSidebarTab = useUIStore((s) => s.setSidebarTab);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const handleBrowseTemplates = () => {
    setSidebarTab('templates');
    if (!sidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <div className="canvas-empty-state">
      <Workflow className="canvas-empty-state__icon" size={64} />
      <h2 className="canvas-empty-state__title">Build your workflow</h2>
      <p className="canvas-empty-state__description">
        Get started by choosing a template from the sidebar, or add blocks to build your workflow step by step.
      </p>
      <button className="canvas-empty-state__cta" onClick={handleBrowseTemplates}>
        <LayoutTemplate size={14} />
        Choose a template
      </button>
    </div>
  );
}
