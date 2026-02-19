// Complete TypeScript interfaces for the workflow state

export type EngineType = 'claude' | 'copilot' | 'codex' | 'custom';

export type PermissionLevel = 'read' | 'write' | 'none';

export type PermissionScope =
  | 'actions'
  | 'attestations'
  | 'checks'
  | 'contents'
  | 'deployments'
  | 'discussions'
  | 'id-token'
  | 'issues'
  | 'models'
  | 'metadata'
  | 'packages'
  | 'pages'
  | 'pull-requests'
  | 'security-events'
  | 'statuses';

export type TriggerEvent =
  | 'push'
  | 'pull_request'
  | 'issues'
  | 'issue_comment'
  | 'discussion'
  | 'discussion_comment'
  | 'schedule'
  | 'workflow_dispatch'
  | 'slash_command'
  | 'release'
  | 'workflow_run'
  | 'pull_request_review'
  | 'pull_request_review_comment'
  | 'create'
  | 'delete'
  | 'fork'
  | 'watch'
  | 'label'
  | 'milestone'
  | 'deployment'
  | 'deployment_status'
  | 'check_run'
  | 'check_suite'
  | 'page_build'
  | 'public'
  | 'merge_group'
  | 'registry_package'
  | 'repository_dispatch'
  | 'status'
  | 'workflow_call'
  | 'gollum'
  | 'branch_protection_rule'
  | 'pull_request_target';

export type ReactionEmoji =
  | '+1'
  | '-1'
  | 'laugh'
  | 'confused'
  | 'heart'
  | 'hooray'
  | 'rocket'
  | 'eyes'
  | 'none';

export type ToolName =
  | 'github'
  | 'bash'
  | 'edit'
  | 'playwright'
  | 'web-fetch'
  | 'web-search'
  | 'cache-memory'
  | 'repo-memory'
  | 'serena'
  | 'agentic-workflows';

export type SafeOutputKey =
  | 'create-issue'
  | 'add-comment'
  | 'create-pull-request'
  | 'add-labels'
  | 'remove-labels'
  | 'close-issue'
  | 'update-issue'
  | 'close-pull-request'
  | 'update-pull-request'
  | 'create-pull-request-review-comment'
  | 'submit-pull-request-review'
  | 'reply-to-pull-request-review-comment'
  | 'resolve-pull-request-review-thread'
  | 'push-to-pull-request-branch'
  | 'mark-pull-request-as-ready-for-review'
  | 'add-reviewer'
  | 'assign-to-user'
  | 'assign-to-agent'
  | 'unassign-from-user'
  | 'assign-milestone'
  | 'link-sub-issue'
  | 'create-discussion'
  | 'close-discussion'
  | 'update-discussion'
  | 'create-code-scanning-alert'
  | 'autofix-code-scanning-alert'
  | 'hide-comment'
  | 'dispatch-workflow'
  | 'upload-asset'
  | 'update-release'
  | 'update-project'
  | 'create-project'
  | 'create-project-status-update'
  | 'create-agent-task'
  | 'create-agent-session'
  | 'missing-tool'
  | 'missing-data'
  | 'noop'
  | 'threat-detection';

export interface TriggerConfig {
  event: TriggerEvent | '';
  activityTypes: string[];
  branches: string[];
  paths: string[];
  schedule: string;
  skipRoles: string[];
  skipBots: boolean;
  roles: string[];
  bots: string[];
  reaction: ReactionEmoji | '';
  statusComment: boolean;
  manualApproval: string;
  slashCommandName: string;
}

export interface EngineConfig {
  type: EngineType | '';
  model: string;
  maxTurns: number | '';
  version: string;
  config: Record<string, unknown>;
}

export interface NetworkConfig {
  allowed: string[];
  blocked: string[];
}

export interface SafeOutputConfig {
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface CompileResult {
  yaml: string;
  warnings: string[];
  error: string | null;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  trigger: Partial<TriggerConfig>;
  engine: Partial<EngineConfig>;
  permissions: Record<string, PermissionLevel>;
  tools: string[];
  safeOutputs: Record<string, boolean | Record<string, unknown>>;
  network: Partial<NetworkConfig>;
  instructions: string;
}

export interface WorkflowState {
  // Metadata
  name: string;
  description: string;

  // Trigger
  trigger: TriggerConfig;

  // Permissions
  permissions: Partial<Record<PermissionScope, PermissionLevel>>;

  // Engine
  engine: EngineConfig;

  // Tools
  tools: string[];

  // Instructions (markdown body)
  instructions: string;

  // Safe outputs
  safeOutputs: Record<string, SafeOutputConfig>;

  // Network
  network: NetworkConfig;

  // Advanced
  timeoutMinutes: number;
  imports: string[];
  environment: Record<string, string>;
  cache: boolean;
  strict: boolean;

  // UI state
  selectedNodeId: string | null;
  viewMode: 'visual' | 'markdown' | 'yaml';
  compiledYaml: string;
  compiledMarkdown: string;
  warnings: string[];
  error: string | null;
  isCompiling: boolean;
  isReady: boolean;
}

export interface WorkflowActions {
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setTrigger: (trigger: Partial<TriggerConfig>) => void;
  setPermissions: (perms: Partial<Record<PermissionScope, PermissionLevel>>) => void;
  setEngine: (engine: Partial<EngineConfig>) => void;
  toggleTool: (tool: string) => void;
  setInstructions: (text: string) => void;
  toggleSafeOutput: (key: string) => void;
  setSafeOutputConfig: (key: string, config: Record<string, unknown>) => void;
  setNetwork: (network: Partial<NetworkConfig>) => void;
  addAllowedDomain: (domain: string) => void;
  removeAllowedDomain: (domain: string) => void;
  addBlockedDomain: (domain: string) => void;
  removeBlockedDomain: (domain: string) => void;
  selectNode: (id: string | null) => void;
  setViewMode: (mode: 'visual' | 'markdown' | 'yaml') => void;
  setCompiledYaml: (yaml: string) => void;
  setCompiledMarkdown: (markdown: string) => void;
  setWarnings: (warnings: string[]) => void;
  setError: (error: string | null) => void;
  setIsCompiling: (isCompiling: boolean) => void;
  setIsReady: (isReady: boolean) => void;
  loadTemplate: (template: WorkflowTemplate) => void;
  reset: () => void;
}

export type WorkflowStore = WorkflowState & WorkflowActions;
