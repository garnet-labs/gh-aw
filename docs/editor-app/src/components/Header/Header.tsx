import { useState, useRef, useEffect } from 'react';
import {
  Play, Download, Copy, ChevronDown, Loader2,
  CircleCheck, CircleAlert, AlertTriangle, PanelLeftClose, PanelLeft,
  LayoutDashboard, Code2, Trash2, FilePlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useUIStore } from '../../stores/uiStore';

export function Header() {
  const name = useWorkflowStore((s) => s.name);
  const setName = useWorkflowStore((s) => s.setName);
  const isCompiling = useWorkflowStore((s) => s.isCompiling);
  const error = useWorkflowStore((s) => s.error);
  const warnings = useWorkflowStore((s) => s.warnings);
  const compiledYaml = useWorkflowStore((s) => s.compiledYaml);
  const compiledMarkdown = useWorkflowStore((s) => s.compiledMarkdown);
  const viewMode = useWorkflowStore((s) => s.viewMode);
  const setViewMode = useWorkflowStore((s) => s.setViewMode);

  const {
    autoCompile, setAutoCompile,
    sidebarOpen, toggleSidebar,
  } = useUIStore();

  const [exportOpen, setExportOpen] = useState(false);
  const [clearHovered, setClearHovered] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportOpen) return;
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [exportOpen]);

  const hasWarnings = warnings.length > 0 && !error;
  const statusIcon = isCompiling
    ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
    : error ? <CircleAlert size={14} />
    : hasWarnings ? <AlertTriangle size={14} />
    : <CircleCheck size={14} />;
  const statusColor = isCompiling ? 'var(--color-accent-fg, #0969da)' : error ? 'var(--color-danger-fg, #cf222e)' : hasWarnings ? 'var(--color-warning-fg, #d4a72c)' : 'var(--color-success-fg, #1a7f37)';
  const statusText = isCompiling ? 'Compiling...' : error ? 'Error' : hasWarnings ? `${warnings.length} warning${warnings.length !== 1 ? 's' : ''}` : 'Ready';

  const handleClear = () => {
    if (!window.confirm('Are you sure? This will clear your entire workflow.')) return;
    useWorkflowStore.getState().reset();
    localStorage.removeItem('workflow-editor-state');
    toast.success('Canvas cleared');
  };

  const handleNewWorkflow = () => {
    if (!window.confirm('Start a new workflow? This will clear your current work.')) return;
    useWorkflowStore.getState().reset();
    localStorage.removeItem('workflow-editor-state');
    useUIStore.getState().setHasSeenOnboarding(false);
    toast.success('Starting new workflow');
  };

  const handleExport = (type: 'md' | 'yml' | 'clipboard') => {
    setExportOpen(false);
    if (type === 'clipboard') {
      navigator.clipboard.writeText(compiledYaml || '').then(() => toast.success('YAML copied to clipboard'));
      return;
    }
    const content = type === 'md' ? compiledMarkdown : compiledYaml;
    const filename = `${name || 'workflow'}.${type === 'md' ? 'md' : 'lock.yml'}`;
    const blob = new Blob([content || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const scrollToErrorPanel = () => {
    document.getElementById('error-panel')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', height: 48,
      borderBottom: '1px solid var(--color-border-default, #d0d7de)',
      background: 'var(--color-bg-default, #ffffff)',
      transition: 'background 0.15s ease, border-color 0.15s ease',
    }}>
      {/* Sidebar toggle */}
      {viewMode === 'visual' && (
        <button onClick={toggleSidebar} style={iconButtonStyle} title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
          {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
        </button>
      )}

      {/* View mode toggle */}
      <div style={viewToggleContainerStyle}>
        <button onClick={() => setViewMode('visual')} style={{ ...viewToggleButtonStyle, ...(viewMode === 'visual' ? viewToggleActiveStyle : {}) }} title="Visual editor">
          <LayoutDashboard size={14} /> Visual
        </button>
        <button onClick={() => setViewMode('markdown')} style={{ ...viewToggleButtonStyle, ...(viewMode === 'markdown' ? viewToggleActiveStyle : {}) }} title="Code editor">
          <Code2 size={14} /> Editor
        </button>
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 20, background: 'var(--color-border-default, #d0d7de)', flexShrink: 0 }} />

      {/* Workflow name */}
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="workflow-name"
        style={{
          border: '1px solid transparent', borderRadius: 6, padding: '3px 8px',
          fontSize: 14, fontWeight: 600, background: 'transparent',
          color: 'var(--color-fg-default, #1f2328)', width: 180, outline: 'none',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--color-border-default, #d0d7de)')}
        onBlur={(e) => (e.target.style.borderColor = 'transparent')}
      />

      {/* Status badge */}
      <div
        role={error || hasWarnings ? 'button' : undefined}
        tabIndex={error || hasWarnings ? 0 : undefined}
        onClick={error || hasWarnings ? scrollToErrorPanel : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500,
          color: statusColor, padding: '2px 8px', borderRadius: 12,
          background: `color-mix(in srgb, ${statusColor} 10%, transparent)`,
          cursor: error || hasWarnings ? 'pointer' : 'default',
          transition: 'opacity 0.15s ease',
        }}
      >
        {statusIcon}
        <span>{statusText}</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Auto-compile */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-fg-muted, #656d76)', cursor: 'pointer', userSelect: 'none' }}>
        <input type="checkbox" checked={autoCompile} onChange={(e) => setAutoCompile(e.target.checked)} style={{ accentColor: 'var(--color-accent-fg, #0969da)' }} />
        Auto
      </label>

      {/* Compile */}
      <button onClick={() => toast.info('Compilation triggered')} disabled={isCompiling}
        style={{ ...actionButtonStyle, opacity: isCompiling ? 0.6 : 1, cursor: isCompiling ? 'not-allowed' : 'pointer' }}>
        <Play size={14} /> Compile
      </button>

      {/* New workflow */}
      <button onClick={handleNewWorkflow} style={actionButtonStyle} title="Start new workflow">
        <FilePlus size={14} /> New
      </button>

      {/* Clear canvas */}
      <button onClick={handleClear}
        onMouseEnter={() => setClearHovered(true)} onMouseLeave={() => setClearHovered(false)}
        style={{
          ...actionButtonStyle,
          color: clearHovered ? 'var(--color-danger-fg, #cf222e)' : 'var(--color-fg-muted, #656d76)',
          borderColor: clearHovered ? 'var(--color-danger-fg, #cf222e)' : 'var(--color-border-default, #d0d7de)',
          transition: 'color 0.15s ease, border-color 0.15s ease, background 0.15s ease',
        }}
        title="Clear canvas">
        <Trash2 size={14} /> Clear
      </button>

      {/* Export dropdown */}
      <div style={{ position: 'relative' }} ref={exportRef}>
        <button onClick={() => setExportOpen(!exportOpen)} style={actionButtonStyle}>
          <Download size={14} /> Export <ChevronDown size={12} />
        </button>
        {exportOpen && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 4,
            background: 'var(--color-bg-default, #ffffff)',
            border: '1px solid var(--color-border-default, #d0d7de)',
            borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            overflow: 'hidden', zIndex: 100, minWidth: 180,
          }}>
            <button onClick={() => handleExport('md')} style={menuItemStyle}><Download size={14} /> Download .md</button>
            <button onClick={() => handleExport('yml')} style={menuItemStyle}><Download size={14} /> Download .yml</button>
            <button onClick={() => handleExport('clipboard')} style={menuItemStyle}><Copy size={14} /> Copy YAML</button>
          </div>
        )}
      </div>

    </header>
  );
}

const iconButtonStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 6, color: 'var(--color-fg-muted, #656d76)', borderRadius: 6,
  width: 32, height: 32,
  transition: 'background 0.15s ease, color 0.15s ease',
};

const actionButtonStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
  fontSize: 13, fontWeight: 500,
  border: '1px solid var(--color-border-default, #d0d7de)', borderRadius: 6,
  background: 'var(--color-bg-default, #ffffff)',
  color: 'var(--color-fg-default, #1f2328)', cursor: 'pointer',
  transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
};

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
  padding: '8px 12px', fontSize: 13, border: 'none', background: 'none',
  color: 'var(--color-fg-default, #1f2328)', cursor: 'pointer',
  textAlign: 'left' as const, transition: 'background 0.15s ease',
};

const viewToggleContainerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 0,
  border: '1px solid var(--color-border-default, #d0d7de)', borderRadius: 8,
  overflow: 'hidden', background: 'var(--color-bg-subtle, #f6f8fa)',
};

const viewToggleButtonStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
  fontSize: 12, fontWeight: 500, border: 'none', background: 'transparent',
  color: 'var(--color-fg-muted, #656d76)', cursor: 'pointer',
  transition: 'background 0.15s ease, color 0.15s ease',
};

const viewToggleActiveStyle: React.CSSProperties = {
  background: 'var(--color-bg-default, #ffffff)',
  color: 'var(--color-fg-default, #1f2328)',
  fontWeight: 600,
  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
};
