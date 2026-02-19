import { useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header/Header';
import { ErrorPanel } from './components/ErrorPanel/ErrorPanel';
import { useUIStore } from './stores/uiStore';
import { useWorkflowStore } from './stores/workflowStore';
import { useAutoCompile } from './hooks/useAutoCompile';
import { initCompiler } from './utils/compiler';
import './styles/globals.css';
import './styles/nodes.css';
import './styles/panels.css';

// Lazy-load heavy components that are not needed for initial render
const Sidebar = lazy(() => import('./components/Sidebar/Sidebar').then(m => ({ default: m.Sidebar })));
const PropertiesPanel = lazy(() => import('./components/Panels/PropertiesPanel').then(m => ({ default: m.PropertiesPanel })));
const EditorView = lazy(() => import('./components/EditorView/EditorView').then(m => ({ default: m.EditorView })));
const YamlPreview = lazy(() => import('./components/YamlPreview/YamlPreview').then(m => ({ default: m.YamlPreview })));
const WelcomeModal = lazy(() => import('./components/Onboarding/WelcomeModal').then(m => ({ default: m.WelcomeModal })));
const LazyToaster = lazy(() => import('sonner').then(m => ({ default: m.Toaster })));

// Canvas is large (~220KB with ReactFlow) -- lazy load with a loading skeleton
const CanvasWithProvider = lazy(() => import('./components/Canvas/CanvasWithProvider'));

/** Lightweight placeholder shown while the canvas (ReactFlow ~220KB) loads */
function CanvasPlaceholder() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-subtle, #f6f8fa)',
      color: 'var(--color-fg-muted, #656d76)',
      fontSize: 14,
    }}>
      Loading canvas...
    </div>
  );
}

export default function App() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const propertiesPanelOpen = useUIStore((s) => s.propertiesPanelOpen);
  const yamlPreviewOpen = useUIStore((s) => s.yamlPreviewOpen);
  const hasSeenOnboarding = useUIStore((s) => s.hasSeenOnboarding);

  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const viewMode = useWorkflowStore((s) => s.viewMode);
  const setIsReady = useWorkflowStore((s) => s.setIsReady);
  const setError = useWorkflowStore((s) => s.setError);

  // Initialize WASM compiler in background -- does NOT block UI render
  useEffect(() => {
    const wasmPath = `${import.meta.env.BASE_URL}wasm/`;
    initCompiler(wasmPath)
      .then(() => setIsReady(true))
      .catch((err) => {
        setError(`Compiler initialization failed: ${err instanceof Error ? err.message : String(err)}`);
      });
  }, [setIsReady, setError]);

  useAutoCompile();

  // Dark/light mode follows browser preference via CSS variables
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.setAttribute('data-color-mode', mq.matches ? 'dark' : 'light');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const isVisualMode = viewMode === 'visual';
  const showProperties = isVisualMode && propertiesPanelOpen && selectedNodeId !== null;

  const layoutClasses = [
    'app-layout',
    !isVisualMode ? 'editor-mode' : '',
    sidebarOpen && isVisualMode ? '' : 'sidebar-collapsed',
    showProperties ? 'properties-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div className={layoutClasses}>
        <div className="app-header">
          <Header />
        </div>
        {isVisualMode ? (
          <>
            <div className="app-sidebar">
              {sidebarOpen && (
                <Suspense fallback={null}>
                  <Sidebar />
                </Suspense>
              )}
            </div>
            <div className="app-canvas">
              <Suspense fallback={<CanvasPlaceholder />}>
                <CanvasWithProvider />
              </Suspense>
            </div>
            {showProperties && (
              <div className="app-properties">
                <Suspense fallback={null}>
                  <PropertiesPanel />
                </Suspense>
              </div>
            )}
          </>
        ) : (
          <div className="app-editor">
            <Suspense fallback={null}>
              <EditorView />
            </Suspense>
          </div>
        )}
        <div className="app-error-panel">
          <ErrorPanel />
        </div>
      </div>
      {isVisualMode && yamlPreviewOpen && (
        <Suspense fallback={null}>
          <YamlPreview />
        </Suspense>
      )}
      {!hasSeenOnboarding && (
        <Suspense fallback={null}>
          <WelcomeModal />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <LazyToaster position="bottom-right" />
      </Suspense>
    </>
  );
}
