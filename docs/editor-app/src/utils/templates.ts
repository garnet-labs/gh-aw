import type { WorkflowTemplate } from '../types/workflow';

export const templates: WorkflowTemplate[] = [
  {
    id: 'pr-code-review',
    name: 'PR Code Review',
    description: 'Automatically review pull requests for code quality, bugs, and best practices',
    category: 'Pull Requests',
    icon: 'code-review',
    trigger: {
      event: 'pull_request',
      activityTypes: ['opened', 'synchronize'],
    },
    engine: { type: 'copilot' },
    permissions: {
      contents: 'read',
      'pull-requests': 'read',
    },
    tools: ['github', 'edit'],
    safeOutputs: {
      'create-pull-request-review-comment': true,
      'submit-pull-request-review': true,
      'add-labels': { allowed: ['needs-changes', 'approved', 'needs-review'] },
    },
    network: { allowed: ['defaults'] },
    instructions: `Review this pull request for code quality, potential bugs, and best practices.
For each issue found, leave a specific comment on the relevant line of code.
Submit an overall review with your assessment.`,
  },
  {
    id: 'issue-triage',
    name: 'Issue Triage Bot',
    description: 'Automatically classify, label, and route new issues to the right team',
    category: 'Issues & Triage',
    icon: 'inbox',
    trigger: {
      event: 'issues',
      activityTypes: ['opened'],
      reaction: 'eyes',
    },
    engine: { type: 'copilot' },
    permissions: {
      issues: 'read',
    },
    tools: ['github'],
    safeOutputs: {
      'add-labels': { allowed: ['bug', 'feature-request', 'question', 'documentation', 'good-first-issue'] },
      'add-comment': { max: 1 },
    },
    network: {},
    instructions: `When a new issue is created:
1. Read the title and description carefully
2. Classify the issue as: bug, feature-request, question, or documentation
3. If it looks like a good first issue for new contributors, also add "good-first-issue"
4. Add a brief comment acknowledging the issue and explaining the classification`,
  },
  {
    id: 'documentation-generator',
    name: 'Documentation Generator',
    description: 'Review code changes and suggest documentation updates',
    category: 'Documentation',
    icon: 'book',
    trigger: {
      event: 'pull_request',
      activityTypes: ['opened', 'synchronize'],
    },
    engine: { type: 'claude' },
    permissions: {
      contents: 'read',
      'pull-requests': 'read',
    },
    tools: ['github', 'edit'],
    safeOutputs: {
      'add-comment': { max: 1 },
      'create-pull-request-review-comment': true,
    },
    network: {},
    instructions: `Review this pull request and check if any documentation needs to be updated.
Look for:
1. New functions or classes that need docstrings
2. Changed APIs that affect existing documentation
3. New features that should be mentioned in README or docs
4. Breaking changes that need migration guides

If documentation updates are needed, comment on the specific code that needs docs
and suggest what documentation should be added or changed.`,
  },
  {
    id: 'security-scanner',
    name: 'Security Scanner',
    description: 'Scan code changes for vulnerabilities and security issues',
    category: 'Security',
    icon: 'shield-check',
    trigger: {
      event: 'pull_request',
      activityTypes: ['opened', 'synchronize'],
    },
    engine: { type: 'claude' },
    permissions: {
      contents: 'read',
      'pull-requests': 'read',
      'security-events': 'write',
    },
    tools: ['github', 'edit', 'web-search'],
    safeOutputs: {
      'create-pull-request-review-comment': true,
      'create-code-scanning-alert': true,
      'add-labels': { allowed: ['security', 'vulnerability'] },
    },
    network: { allowed: ['defaults'] },
    instructions: `Scan this pull request for security vulnerabilities:
1. Look for SQL injection, XSS, and command injection risks
2. Check for hardcoded secrets or credentials
3. Identify insecure dependencies
4. Flag missing input validation
5. Check for OWASP Top 10 issues

For each finding, comment on the specific line and suggest a fix.
Create a security alert for critical or high severity issues.`,
  },
  {
    id: 'slash-command-bot',
    name: 'Slash Command Bot',
    description: 'Create a custom bot that responds to /commands in issue and PR comments',
    category: 'Custom',
    icon: 'terminal',
    trigger: {
      event: 'slash_command',
      reaction: 'rocket',
      statusComment: true,
    },
    engine: { type: 'copilot' },
    permissions: {
      contents: 'read',
      issues: 'read',
    },
    tools: ['github'],
    safeOutputs: {
      'add-comment': true,
      'add-labels': { allowed: [] },
    },
    network: {},
    instructions: `You are a helpful bot that responds to slash commands.
When someone uses your command, read their request and respond helpfully.
Add a comment with your response on the issue or PR where the command was used.`,
  },
  {
    id: 'release-notes',
    name: 'Release Notes Generator',
    description: 'Automatically generate and update release notes when a new release is published',
    category: 'Documentation',
    icon: 'tag',
    trigger: {
      event: 'release',
      activityTypes: ['published'],
    },
    engine: { type: 'claude' },
    permissions: {
      contents: 'read',
    },
    tools: ['github'],
    safeOutputs: {
      'update-release': true,
      'add-comment': true,
    },
    network: {},
    instructions: `A new release has been published. Generate comprehensive release notes by:
1. Listing all commits since the last release
2. Grouping changes by type: Features, Bug Fixes, Improvements, Breaking Changes
3. Highlighting notable changes with brief descriptions
4. Thanking contributors by name
5. Update the release body with the generated notes`,
  },
  {
    id: 'stale-issue-cleanup',
    name: 'Stale Issue Cleanup',
    description: 'Automatically warn and close issues with no recent activity',
    category: 'Issues & Triage',
    icon: 'clock',
    trigger: {
      event: 'schedule',
      schedule: 'daily',
    },
    engine: { type: 'copilot' },
    permissions: {
      issues: 'read',
    },
    tools: ['github'],
    safeOutputs: {
      'add-comment': { max: 10 },
      'add-labels': { allowed: ['stale', 'inactive'] },
      'close-issue': true,
    },
    network: {},
    instructions: `Search for issues that have had no activity in the last 30 days.
For each stale issue:
1. If it hasn't been warned yet, add the "stale" label and post a comment:
   "This issue has been inactive for 30 days. It will be closed in 7 days if no further activity occurs."
2. If it already has the "stale" label and still has no activity after 7 more days, close it with a comment:
   "Closing due to inactivity. Feel free to reopen if this is still relevant."
3. If a stale issue gets new activity, remove the "stale" label.`,
  },
  {
    id: 'blank-canvas',
    name: 'Blank Canvas',
    description: 'Start from scratch with an empty workflow',
    category: 'Custom',
    icon: 'plus',
    trigger: {},
    engine: {},
    permissions: {},
    tools: [],
    safeOutputs: {},
    network: {},
    instructions: '',
  },
];

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return templates.filter((t) => t.category === category);
}

export const templateCategories = [
  'Pull Requests',
  'Issues & Triage',
  'Documentation',
  'Security',
  'Custom',
];
