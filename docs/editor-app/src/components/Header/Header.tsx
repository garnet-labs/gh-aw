import { useState, useRef, useEffect } from 'react';
import {
  Sun, Moon, Play, Download, Copy, ChevronDown, Loader2,
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
    autoCompile, setAutoCompile, theme, setTheme,
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
  const statusColor = isCompiling ? '#0969da' : error ? '#cf222e' : hasWarnings ? '#d4a72c' : '#1a7f37';
  const statusText = isCompiling ? 'Compiling...' : error ? 'Error' : hasWarnings ? `${warnings.length} warning${warnings.length !== 1 ? 's' : ''}` : 'Ready';

  const resolvedTheme = theme === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

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
      display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', height: 56,
      borderBottom: '1px solid var(--borderColor-default, #d1d9e0)',
      background: 'var(--bgColor-default, #ffffff)',
    }}>
      {/* Sidebar toggle — only in visual mode */}
      {viewMode === 'visual' && (
        <button onClick={toggleSidebar} style={iconButtonStyle} title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
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

      {/* Workflow name */}
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="workflow-name"
        style={{ border: '1px solid transparent', borderRadius: 6, padding: '4px 8px', fontSize: 14, fontWeight: 600, background: 'transparent', color: 'var(--fgColor-default, #1f2328)', width: 200, outline: 'none' }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--borderColor-default, #d1d9e0)')}
        onBlur={(e) => (e.target.style.borderColor = 'transparent')}
      />

      {/* Status badge — clickable when error/warning */}
      <div
        role={error || hasWarnings ? 'button' : undefined}
        tabIndex={error || hasWarnings ? 0 : undefined}
        onClick={error || hasWarnings ? scrollToErrorPanel : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500,
          color: statusColor, padding: '2px 8px', borderRadius: 12,
          background: `color-mix(in srgb, ${statusColor} 10%, transparent)`,
          cursor: error || hasWarnings ? 'pointer' : 'default',
        }}
      >
        {statusIcon}
        <span>{statusText}</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Auto-compile */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fgColor-muted, #656d76)', cursor: 'pointer', userSelect: 'none' }}>
        <input type="checkbox" checked={autoCompile} onChange={(e) => setAutoCompile(e.target.checked)} style={{ accentColor: '#0969da' }} />
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
        style={{ ...actionButtonStyle, color: clearHovered ? '#cf222e' : 'var(--fgColor-muted, #656d76)', borderColor: clearHovered ? '#cf222e' : 'var(--borderColor-default, #d1d9e0)', transition: 'color 0.15s, border-color 0.15s' }}
        title="Clear canvas">
        <Trash2 size={14} /> Clear
      </button>

      {/* Export dropdown */}
      <div style={{ position: 'relative' }} ref={exportRef}>
        <button onClick={() => setExportOpen(!exportOpen)} style={actionButtonStyle}>
          <Download size={14} /> Export <ChevronDown size={12} />
        </button>
        {exportOpen && (
          <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'var(--bgColor-default, #ffffff)', border: '1px solid var(--borderColor-default, #d1d9e0)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 100, minWidth: 180 }}>
            <button onClick={() => handleExport('md')} style={menuItemStyle}><Download size={14} /> Download .md</button>
            <button onClick={() => handleExport('yml')} style={menuItemStyle}><Download size={14} /> Download .yml</button>
            <button onClick={() => handleExport('clipboard')} style={menuItemStyle}><Copy size={14} /> Copy YAML</button>
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} style={iconButtonStyle}
        title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}>
        {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}

const iconButtonStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, color: 'var(--fgColor-muted, #656d76)', borderRadius: 6 };
const actionButtonStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', fontSize: 13, fontWeight: 500, border: '1px solid var(--borderColor-default, #d1d9e0)', borderRadius: 6, background: 'var(--bgColor-default, #ffffff)', color: 'var(--fgColor-default, #1f2328)', cursor: 'pointer' };
const menuItemStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 13, border: 'none', background: 'none', color: 'var(--fgColor-default, #1f2328)', cursor: 'pointer', textAlign: 'left' as const };
const viewToggleContainerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--borderColor-default, #d1d9e0)', borderRadius: 8, overflow: 'hidden', background: 'var(--bgColor-subtle, #f6f8fa)' };
const viewToggleButtonStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', fontSize: 12, fontWeight: 500, border: 'none', background: 'transparent', color: 'var(--fgColor-muted, #656d76)', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' };
const viewToggleActiveStyle: React.CSSProperties = { background: 'var(--bgColor-default, #ffffff)', color: 'var(--fgColor-default, #1f2328)', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' };
