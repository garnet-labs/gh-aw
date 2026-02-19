# Visual Workflow Editor — Architecture

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Build | Vite 6 + React 19 + TypeScript 5.7 | Fast HMR, modern bundling |
| Visual Graph | @xyflow/react v12 (React Flow) | Node-based flow editor |
| UI Components | @primer/react v37 | GitHub-native design system |
| Accessible Primitives | @radix-ui/* | Dialog, tooltip, select, tabs, accordion |
| State Management | Zustand v5 | Lightweight, middleware-ready store |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable | Sidebar-to-canvas DnD |
| Icons | @primer/octicons-react + lucide-react | Consistent iconography |
| Animations | framer-motion v11 | Panel transitions, node effects |
| Syntax Highlighting | Prism.js (via CDN or prism-react-renderer) | YAML output highlighting |
| Notifications | sonner | Toast notifications |
| WASM Runtime | Go WASM (existing gh-aw.wasm) | Real-time compilation |

## Build Configuration

```
docs/editor-app/           ← Vite project root
├── vite.config.ts         ← Output to ../public/editor/
├── index.html             ← SPA entry point
├── public/                ← Static assets (copied as-is)
└── src/                   ← React source
```

**Vite config key points:**
- `build.outDir`: `../public/editor/`
- `base`: `/gh-aw/editor/` (GitHub Pages subpath)
- WASM files served from `/gh-aw/wasm/` (existing location)
- Dev server proxies `/wasm/` to `../public/wasm/`

## Component Hierarchy

```
<App>
├── <ThemeProvider>                    # Primer theme (light/dark)
│   ├── <Header>                      # Logo, workflow name, status, actions
│   │   ├── <WorkflowNameInput>
│   │   ├── <CompilationStatus>       # Ready / Compiling / Error badge
│   │   ├── <AutoCompileToggle>
│   │   ├── <CompileButton>
│   │   ├── <ExportMenu>             # Download .md, .yml, copy clipboard
│   │   └── <ThemeToggle>
│   │
│   ├── <MainLayout>                  # Three-panel resizable layout
│   │   ├── <Sidebar>                 # Left panel (240px, collapsible)
│   │   │   ├── <NodePalette>         # Drag-to-add node categories
│   │   │   │   ├── <PaletteCategory> # "Triggers", "Configuration", etc.
│   │   │   │   └── <PaletteItem>     # Individual draggable node type
│   │   │   ├── <TemplateGallery>     # Pre-built workflow templates
│   │   │   │   ├── <TemplateCard>
│   │   │   │   └── <TemplatePreview>
│   │   │   └── <ViewToggle>          # Switch: Visual / Markdown / YAML
│   │   │
│   │   ├── <Canvas>                  # Center panel (flex-grow)
│   │   │   ├── <ReactFlowProvider>
│   │   │   │   ├── <WorkflowGraph>   # React Flow instance
│   │   │   │   │   ├── <TriggerNode>
│   │   │   │   │   ├── <PermissionsNode>
│   │   │   │   │   ├── <EngineNode>
│   │   │   │   │   ├── <ToolsNode>
│   │   │   │   │   ├── <InstructionsNode>
│   │   │   │   │   ├── <SafeOutputsNode>
│   │   │   │   │   ├── <NetworkNode>
│   │   │   │   │   └── <StepsNode>
│   │   │   │   ├── <MiniMap>
│   │   │   │   └── <Controls>        # Zoom, fit, lock
│   │   │   └── <EmptyState>          # Shown when no nodes
│   │   │
│   │   └── <PropertiesPanel>         # Right panel (360px, collapsible)
│   │       ├── <TriggerPanel>
│   │       ├── <PermissionsPanel>
│   │       ├── <EnginePanel>
│   │       ├── <ToolsPanel>
│   │       ├── <InstructionsPanel>
│   │       ├── <SafeOutputsPanel>
│   │       ├── <NetworkPanel>
│   │       └── <StepsPanel>
│   │
│   ├── <YamlPreviewDrawer>           # Bottom drawer / side panel
│   │   ├── <TabBar>                  # "YAML Output" | "Markdown Source"
│   │   ├── <SyntaxHighlighter>
│   │   └── <CopyButton>
│   │
│   ├── <OnboardingModal>             # First-visit welcome
│   ├── <GuidedTour>                  # Step-by-step tooltips
│   └── <Toaster>                     # Notification toasts
```

## State Model (Zustand)

```typescript
interface WorkflowState {
  // Metadata
  name: string;
  description: string;

  // Trigger configuration
  trigger: {
    event: string;           // 'issues' | 'pull_request' | 'issue_comment' | ...
    activityTypes: string[]; // 'opened' | 'closed' | 'labeled' | ...
    branches?: string[];
    paths?: string[];
    schedule?: string;       // cron expression
    skipRoles?: string[];
    skipBots?: boolean;
  };

  // Permissions
  permissions: Record<string, 'read' | 'write'>;
  // e.g. { contents: 'write', issues: 'write', pull_requests: 'read' }

  // Engine
  engine: {
    type: 'claude' | 'copilot' | 'codex' | 'custom';
    model?: string;
    config?: Record<string, unknown>;
  };

  // Tools
  tools: string[];
  // e.g. ['github', 'playwright', 'bash', 'web-search']

  // Instructions (markdown body)
  instructions: string;

  // Safe outputs
  safeOutputs: Record<string, boolean | Record<string, unknown>>;
  // e.g. { 'create-issue': true, 'add-comment': true, 'add-labels': { labels: ['bug'] } }

  // Network
  network: {
    allowed: string[];
    blocked: string[];
  };

  // Advanced
  sandbox?: Record<string, unknown>;
  mcpServers?: Record<string, unknown>;
  steps?: unknown[];
  postSteps?: unknown[];
  imports?: string[];
  environment?: Record<string, string>;
  cache?: boolean;
  strict?: boolean;

  // UI state
  selectedNodeId: string | null;
  viewMode: 'visual' | 'markdown' | 'yaml';
  compiledYaml: string;
  compiledMarkdown: string;
  warnings: string[];
  error: string | null;
  isCompiling: boolean;
  isReady: boolean;

  // Actions
  setTrigger: (trigger: Partial<WorkflowState['trigger']>) => void;
  setPermissions: (perms: Record<string, 'read' | 'write'>) => void;
  setEngine: (engine: Partial<WorkflowState['engine']>) => void;
  toggleTool: (tool: string) => void;
  setInstructions: (text: string) => void;
  toggleSafeOutput: (key: string) => void;
  setNetwork: (network: Partial<WorkflowState['network']>) => void;
  selectNode: (id: string | null) => void;
  setViewMode: (mode: 'visual' | 'markdown' | 'yaml') => void;
  loadTemplate: (template: WorkflowTemplate) => void;
  reset: () => void;
}
```

## Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Visual UI   │────▶│ Zustand Store │────▶│ Markdown Generator│
│  (React)     │     │  (state)     │     │  (state → .md)   │
└──────────────┘     └──────────────┘     └──────────────────┘
                                                   │
                                                   ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  YAML Output │◀────│ Web Worker   │◀────│ WASM Compiler    │
│  (preview)   │     │ (postMessage)│     │ (gh-aw.wasm)     │
└──────────────┘     └──────────────┘     └──────────────────┘
```

1. User interacts with visual UI (clicks, types, toggles)
2. React components call Zustand actions
3. Zustand middleware triggers markdown generation (debounced 400ms)
4. Generated markdown is sent to Web Worker via postMessage
5. Worker runs WASM `compileWorkflow(markdown)`
6. Result (yaml, warnings, error) posted back to main thread
7. Zustand store updates `compiledYaml`, `warnings`, `error`
8. YAML preview panel re-renders with new output

## File Structure

```
docs/editor-app/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── ARCHITECTURE.md
├── DESIGN.md
├── USER-JOURNEYS.md
└── src/
    ├── main.tsx                    # React entry point
    ├── App.tsx                     # Root component
    ├── types/
    │   ├── workflow.ts             # WorkflowState, WorkflowTemplate types
    │   ├── nodes.ts                # React Flow node type definitions
    │   └── compiler.ts             # WASM compiler message types
    ├── stores/
    │   ├── workflowStore.ts        # Main Zustand store
    │   └── uiStore.ts              # UI-only state (panels, theme)
    ├── utils/
    │   ├── markdownGenerator.ts    # State → markdown conversion
    │   ├── compiler.ts             # WASM compiler bridge
    │   ├── templates.ts            # Template definitions
    │   └── fieldDescriptions.ts    # Plain English field descriptions
    ├── components/
    │   ├── Header/
    │   │   ├── Header.tsx
    │   │   ├── CompilationStatus.tsx
    │   │   └── ExportMenu.tsx
    │   ├── Sidebar/
    │   │   ├── Sidebar.tsx
    │   │   ├── NodePalette.tsx
    │   │   └── TemplateGallery.tsx
    │   ├── Canvas/
    │   │   ├── WorkflowGraph.tsx
    │   │   └── EmptyState.tsx
    │   ├── Nodes/
    │   │   ├── BaseNode.tsx         # Shared node chrome
    │   │   ├── TriggerNode.tsx
    │   │   ├── PermissionsNode.tsx
    │   │   ├── EngineNode.tsx
    │   │   ├── ToolsNode.tsx
    │   │   ├── InstructionsNode.tsx
    │   │   ├── SafeOutputsNode.tsx
    │   │   ├── NetworkNode.tsx
    │   │   └── StepsNode.tsx
    │   ├── Panels/
    │   │   ├── PanelContainer.tsx   # Shared panel chrome
    │   │   ├── TriggerPanel.tsx
    │   │   ├── PermissionsPanel.tsx
    │   │   ├── EnginePanel.tsx
    │   │   ├── ToolsPanel.tsx
    │   │   ├── InstructionsPanel.tsx
    │   │   ├── SafeOutputsPanel.tsx
    │   │   ├── NetworkPanel.tsx
    │   │   └── StepsPanel.tsx
    │   ├── YamlPreview/
    │   │   ├── YamlPreview.tsx
    │   │   └── MarkdownSource.tsx
    │   ├── Onboarding/
    │   │   ├── WelcomeModal.tsx
    │   │   └── GuidedTour.tsx
    │   └── shared/
    │       ├── ResizablePanel.tsx
    │       ├── HelpTooltip.tsx
    │       ├── FieldLabel.tsx       # Label + help icon + description
    │       └── StatusBadge.tsx
    ├── hooks/
    │   ├── useCompiler.ts           # WASM compilation hook
    │   ├── useAutoCompile.ts        # Debounced auto-compile
    │   └── useTheme.ts              # Theme detection + persistence
    └── styles/
        ├── globals.css              # Reset, Primer tokens
        ├── nodes.css                # React Flow node styles
        └── panels.css               # Property panel styles
```

## WASM Integration

The existing WASM infrastructure is preserved:
- `docs/public/wasm/gh-aw.wasm` — 16MB Go WASM binary
- `docs/public/wasm/wasm_exec.js` — Go runtime glue
- `docs/public/wasm/compiler-loader.js` — Worker API wrapper
- `docs/public/wasm/compiler-worker.js` — Web Worker script

The React app creates a typed bridge:

```typescript
// src/utils/compiler.ts
import { createWorkerCompiler } from '/wasm/compiler-loader.js';

let compiler: WorkerCompiler | null = null;

export async function initCompiler(): Promise<void> {
  compiler = await createWorkerCompiler('/wasm/');
}

export async function compile(markdown: string): Promise<CompileResult> {
  if (!compiler) throw new Error('Compiler not initialized');
  return compiler.compile(markdown);
}
```

The `useAutoCompile` hook subscribes to store changes and triggers compilation:

```typescript
// src/hooks/useAutoCompile.ts
export function useAutoCompile() {
  const store = useWorkflowStore();

  useEffect(() => {
    const unsubscribe = useWorkflowStore.subscribe(
      (state) => generateMarkdown(state),
      debounce((markdown) => {
        compile(markdown).then(result => {
          store.setCompilationResult(result);
        });
      }, 400)
    );
    return unsubscribe;
  }, []);
}
```
