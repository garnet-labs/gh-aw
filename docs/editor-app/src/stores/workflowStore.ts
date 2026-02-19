import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WorkflowStore,
  WorkflowState,
  TriggerConfig,
  EngineConfig,
  NetworkConfig,
  PermissionScope,
  PermissionLevel,
  WorkflowTemplate,
  SafeOutputConfig,
} from '../types/workflow';

const defaultTrigger: TriggerConfig = {
  event: '',
  activityTypes: [],
  branches: [],
  paths: [],
  schedule: '',
  skipRoles: [],
  skipBots: false,
  roles: [],
  bots: [],
  reaction: '',
  statusComment: false,
  manualApproval: '',
  slashCommandName: '',
};

const defaultEngine: EngineConfig = {
  type: '',
  model: '',
  maxTurns: '',
  version: '',
  config: {},
};

const defaultNetwork: NetworkConfig = {
  allowed: [],
  blocked: [],
};

const initialState: WorkflowState = {
  name: '',
  description: '',
  trigger: { ...defaultTrigger },
  permissions: {},
  engine: { ...defaultEngine },
  tools: [],
  instructions: '',
  safeOutputs: {},
  network: { ...defaultNetwork },
  timeoutMinutes: 15,
  imports: [],
  environment: {},
  cache: false,
  strict: false,
  selectedNodeId: null,
  viewMode: 'visual',
  compiledYaml: '',
  compiledMarkdown: '',
  warnings: [],
  error: null,
  isCompiling: false,
  isReady: false,
};

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set) => ({
      ...initialState,

      setName: (name: string) => set({ name }),

      setDescription: (description: string) => set({ description }),

      setTrigger: (trigger: Partial<TriggerConfig>) =>
        set((state) => ({
          trigger: { ...state.trigger, ...trigger },
        })),

      setPermissions: (perms: Partial<Record<PermissionScope, PermissionLevel>>) =>
        set((state) => ({
          permissions: { ...state.permissions, ...perms },
        })),

      setEngine: (engine: Partial<EngineConfig>) =>
        set((state) => ({
          engine: { ...state.engine, ...engine },
        })),

      toggleTool: (tool: string) =>
        set((state) => ({
          tools: state.tools.includes(tool)
            ? state.tools.filter((t) => t !== tool)
            : [...state.tools, tool],
        })),

      setInstructions: (instructions: string) => set({ instructions }),

      toggleSafeOutput: (key: string) =>
        set((state) => {
          const current = state.safeOutputs[key];
          const next = { ...state.safeOutputs };
          if (current?.enabled) {
            delete next[key];
          } else {
            next[key] = { enabled: true, config: current?.config ?? {} };
          }
          return { safeOutputs: next };
        }),

      setSafeOutputConfig: (key: string, config: Record<string, unknown>) =>
        set((state) => ({
          safeOutputs: {
            ...state.safeOutputs,
            [key]: {
              enabled: state.safeOutputs[key]?.enabled ?? true,
              config,
            },
          },
        })),

      setNetwork: (network: Partial<NetworkConfig>) =>
        set((state) => ({
          network: { ...state.network, ...network },
        })),

      addAllowedDomain: (domain: string) =>
        set((state) => ({
          network: {
            ...state.network,
            allowed: state.network.allowed.includes(domain)
              ? state.network.allowed
              : [...state.network.allowed, domain],
          },
        })),

      removeAllowedDomain: (domain: string) =>
        set((state) => ({
          network: {
            ...state.network,
            allowed: state.network.allowed.filter((d) => d !== domain),
          },
        })),

      addBlockedDomain: (domain: string) =>
        set((state) => ({
          network: {
            ...state.network,
            blocked: state.network.blocked.includes(domain)
              ? state.network.blocked
              : [...state.network.blocked, domain],
          },
        })),

      removeBlockedDomain: (domain: string) =>
        set((state) => ({
          network: {
            ...state.network,
            blocked: state.network.blocked.filter((d) => d !== domain),
          },
        })),

      selectNode: (id: string | null) => set({ selectedNodeId: id }),

      setViewMode: (mode: 'visual' | 'markdown' | 'yaml') => set({ viewMode: mode }),

      setCompiledYaml: (compiledYaml: string) => set({ compiledYaml }),

      setCompiledMarkdown: (compiledMarkdown: string) => set({ compiledMarkdown }),

      setWarnings: (warnings: string[]) => set({ warnings }),

      setError: (error: string | null) => set({ error }),

      setIsCompiling: (isCompiling: boolean) => set({ isCompiling }),

      setIsReady: (isReady: boolean) => set({ isReady }),

      loadTemplate: (template: WorkflowTemplate) =>
        set({
          name: template.name.toLowerCase().replace(/\s+/g, '-'),
          description: template.description,
          trigger: {
            ...defaultTrigger,
            ...template.trigger,
          },
          engine: {
            ...defaultEngine,
            ...template.engine,
          },
          permissions: template.permissions,
          tools: template.tools,
          instructions: template.instructions,
          safeOutputs: Object.fromEntries(
            Object.entries(template.safeOutputs).map(([key, value]) => [
              key,
              {
                enabled: true,
                config: typeof value === 'object' && value !== null ? value as Record<string, unknown> : {},
              } satisfies SafeOutputConfig,
            ])
          ),
          network: {
            ...defaultNetwork,
            ...template.network,
          },
          selectedNodeId: null,
          error: null,
          warnings: [],
        }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'workflow-editor-state',
      partialize: (state) => ({
        name: state.name,
        description: state.description,
        trigger: state.trigger,
        permissions: state.permissions,
        engine: state.engine,
        tools: state.tools,
        instructions: state.instructions,
        safeOutputs: state.safeOutputs,
        network: state.network,
        timeoutMinutes: state.timeoutMinutes,
        imports: state.imports,
        environment: state.environment,
        cache: state.cache,
        strict: state.strict,
      }),
    }
  )
);
