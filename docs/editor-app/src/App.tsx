import { useEffect } from 'react';
import { ThemeProvider, BaseStyles } from '@primer/react';
import { ReactFlowProvider } from '@xyflow/react';
import { Toaster } from 'sonner';
import { Header } from './components/Header/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { WorkflowGraph } from './components/Canvas/WorkflowGraph';
import { WelcomeModal } from './components/Onboarding/WelcomeModal';
import { PropertiesPanel } from './components/Panels/PropertiesPanel';
import { YamlPreview } from './components/YamlPreview/YamlPreview';
import { useUIStore } from './stores/uiStore';
import { useWorkflowStore } from './stores/workflowStore';
import { useAutoCompile } from './hooks/useAutoCompile';
import { initCompiler } from './utils/compiler';
import './styles/globals.css';
import './styles/nodes.css';
import './styles/panels.css';

export default function App() {
  const {
    sidebarOpen,
    propertiesPanelOpen,
    theme,
    hasSeenOnboarding,
  } = useUIStore();

  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const setIsReady = useWorkflowStore((s) => s.setIsReady);
  const setError = useWorkflowStore((s) => s.setError);

  // Initialize WASM compiler
  useEffect(() => {
    // WASM files are in public/wasm/ → served at BASE_URL/wasm/
    const wasmPath = `${import.meta.env.BASE_URL}wasm/`;
    initCompiler(wasmPath)
      .then(() => setIsReady(true))
      .catch((err) => {
        console.error('Failed to initialize compiler:', err);
        setError(`Compiler initialization failed: ${err instanceof Error ? err.message : String(err)}`);
      });
  }, [setIsReady, setError]);

  // Enable auto-compilation
  useAutoCompile();

  // Resolve theme for <html> attribute
  useEffect(() => {
    const resolveAndApply = (mode: typeof theme) => {
      if (mode === 'auto') {
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-color-mode', dark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-color-mode', mode);
      }
    };

    resolveAndApply(theme);

    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => resolveAndApply('auto');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  const resolvedTheme = theme === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  const showProperties = propertiesPanelOpen && selectedNodeId !== null;

  const layoutClasses = [
    'app-layout',
    sidebarOpen ? '' : 'sidebar-collapsed',
    showProperties ? 'properties-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <ThemeProvider colorMode={resolvedTheme === 'dark' ? 'night' : 'day'}>
      <BaseStyles>
        <div className={layoutClasses}>
          <div className="app-header">
            <Header />
          </div>
          <div className="app-sidebar">
            {sidebarOpen && <Sidebar />}
          </div>
          <div className="app-canvas">
            <ReactFlowProvider>
              <WorkflowGraph />
            </ReactFlowProvider>
          </div>
          {showProperties && (
            <div className="app-properties">
              <PropertiesPanel />
            </div>
          )}
        </div>
        <YamlPreview />
        {!hasSeenOnboarding && <WelcomeModal />}
        <Toaster position="bottom-right" />
      </BaseStyles>
    </ThemeProvider>
  );
}
