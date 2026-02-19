# No-Code User Journeys & Simplification Strategy

A complete guide for translating GitHub Agentic Workflows into a visual, no-code experience for non-technical users.

---

## Table of Contents

1. [Plain English Translations](#1-plain-english-translations)
2. [User Personas](#2-user-personas)
3. [User Journeys](#3-user-journeys)
4. [Template Definitions](#4-template-definitions)
5. [Progressive Disclosure Strategy](#5-progressive-disclosure-strategy)
6. [Smart Defaults](#6-smart-defaults)
7. [Validation Messages](#7-validation-messages)

---

## 1. Plain English Translations

Every frontmatter field from the workflow schema, translated into language a non-technical user can understand.

### Top-Level Fields

| Technical Field | Plain English Label | Plain English Description | Example |
|---|---|---|---|
| `name` | **Workflow Name** | A short name for your workflow that shows up in GitHub. | `name: pr-reviewer` -> "PR Reviewer" |
| `description` | **Description** | An optional note describing what this workflow does. | "Automatically reviews pull requests for code quality" |
| `on` | **When to Run** | What event in your repository should start this workflow. | `on: pull_request` -> "When someone creates or updates a pull request" |
| `engine` | **AI Assistant** | Which AI model powers this workflow. | `engine: claude` -> "Claude (by Anthropic)" |
| `permissions` | **What the Agent Can Access** | What parts of your repository the AI is allowed to read or change. | `permissions: contents: read` -> "Can view files but not change them" |
| `tools` | **Tools & Capabilities** | What tools the AI agent can use to get work done. | `tools: [github, playwright]` -> "GitHub API access and web browser" |
| `safe-outputs` | **Actions the Agent Can Take** | What the AI is allowed to create or modify on your behalf (comments, issues, PRs, labels). | `safe-outputs: create-issue:` -> "Can create new issues" |
| `network` | **Internet Access** | Which websites and services the agent is allowed to connect to. | `network: allowed: [defaults]` -> "Standard GitHub and AI services only" |
| `sandbox` | **Security Sandbox** | How the agent is isolated for safety while running. | `sandbox: awf` -> "Runs inside a secure container" |
| `timeout-minutes` | **Time Limit** | Maximum time the workflow is allowed to run before it stops automatically. | `timeout-minutes: 15` -> "Stops after 15 minutes" |
| `concurrency` | **Overlap Handling** | What happens if this workflow is triggered again while already running. | `cancel-in-progress: true` -> "Cancel the previous run and start fresh" |
| `env` | **Settings & Variables** | Custom values you can pass into the workflow. | `env: THEME: dark` -> "Setting: THEME = dark" |
| `run-name` | **Run Display Name** | Custom name shown for each workflow run in GitHub. | "PR Review for #42" |
| `runs-on` | **Runner Type** | What type of server runs this workflow (usually leave as default). | `runs-on: ubuntu-latest` -> "Standard Linux server" |
| `imports` | **Include Shared Instructions** | Pull in reusable instruction snippets from shared files. | "Include: keep-it-short, use-emojis" |
| `labels` | **Workflow Tags** | Tags to help organize and find your workflows. | `labels: [review, quality]` |
| `tracker-id` | **Tracking ID** | A unique ID to link all issues, PRs, and comments created by this workflow. | "review-bot-2024" |
| `source` | **Source Reference** | Where this workflow was originally imported from. | "community/pr-review-template" |
| `cache` | **Speed Optimization** | Store files between runs to make the workflow faster next time. | "Cache npm packages" |
| `steps` | **Custom Steps (Before)** | Additional steps to run before the AI starts working. | "Install Python dependencies" |
| `post-steps` | **Custom Steps (After)** | Additional steps to run after the AI finishes. | "Upload reports to S3" |
| `mcp-servers` | **External AI Tool Servers** | Connect to additional AI tool servers for specialized capabilities. | "Slack notification server" |
| `if` | **Run Condition** | A condition that must be true for the workflow to execute. | "Only run if the PR is not a draft" |
| `strict` | **Strict Mode** | Enable extra security validation for the workflow. | "On" -> Enhanced security checks |
| `rate-limit` | **Usage Limits** | How often users can trigger this workflow. | "Max 5 times per hour" |
| `safe-inputs` | **Custom Tools** | Define lightweight custom tools as JavaScript or shell scripts. | "Currency converter tool" |
| `plugins` | **Plugins** | Install third-party plugins before the workflow runs. | "Install linting plugin" |
| `secrets` | **Secret Values** | Sensitive values (API keys, tokens) passed securely to the workflow. | "OpenAI API key" |
| `secret-masking` | **Secret Redaction** | How sensitive values are hidden in logs and outputs. | "Redact all API keys" |
| `bots` | **Allowed Bots** | Bot accounts that are allowed to trigger this workflow. | "dependabot, renovate" |
| `runtimes` | **Runtime Versions** | Override default versions of programming languages. | "Use Node.js 20" |

### Trigger Events (`on:` children)

| Technical Trigger | Plain English Label | When This Happens |
|---|---|---|
| `push` | **Code is pushed** | Someone pushes code changes to a branch |
| `pull_request` | **Pull request activity** | Someone creates, updates, or closes a pull request |
| `issues` | **Issue activity** | Someone creates, edits, closes, or reopens an issue |
| `issue_comment` | **New comment** | Someone adds or edits a comment on an issue or PR |
| `discussion` | **Discussion activity** | Someone creates or updates a discussion |
| `discussion_comment` | **Discussion comment** | Someone comments on a discussion |
| `schedule` | **On a schedule** | Runs automatically at specific times (e.g., "Every Monday at 9 AM") |
| `workflow_dispatch` | **Manual trigger** | Someone clicks "Run workflow" in GitHub |
| `slash_command` | **Slash command** | Someone types a command like `/review` in a comment |
| `release` | **New release** | A new release is published or updated |
| `workflow_run` | **After another workflow** | Runs after a different workflow finishes |
| `pull_request_review` | **PR review submitted** | Someone submits a review on a pull request |
| `pull_request_review_comment` | **PR review comment** | Someone adds a comment on specific code in a PR |
| `create` | **Branch or tag created** | Someone creates a new branch or tag |
| `delete` | **Branch or tag deleted** | Someone deletes a branch or tag |
| `fork` | **Repository forked** | Someone forks the repository |
| `watch` | **Repository starred** | Someone stars the repository |
| `label` | **Label changed** | A label is created, edited, or deleted |
| `milestone` | **Milestone changed** | A milestone is created, closed, or edited |
| `deployment` | **Deployment created** | A new deployment is initiated |
| `deployment_status` | **Deployment status** | A deployment status is updated |
| `check_run` | **Check run** | A CI/CD check is created or completed |
| `check_suite` | **Check suite** | A group of CI/CD checks starts or finishes |
| `page_build` | **GitHub Pages build** | A GitHub Pages site is built |
| `public` | **Repository made public** | A private repository is changed to public |
| `merge_group` | **Merge queue** | A PR enters the merge queue |
| `registry_package` | **Package published** | A package is published or updated |
| `repository_dispatch` | **Custom webhook** | A custom event is sent to the repository |
| `status` | **Commit status changed** | A commit's status check changes |
| `workflow_call` | **Called by another workflow** | This workflow is invoked by another workflow |
| `gollum` | **Wiki page updated** | A wiki page is created or edited |
| `branch_protection_rule` | **Branch protection changed** | Branch protection settings are modified |
| `pull_request_target` | **PR from fork (secure)** | Like pull_request but runs securely for fork PRs |

### Trigger Modifiers

| Technical Field | Plain English Label | Description |
|---|---|---|
| `on.stop-after` | **Stop running after** | Stop accepting new triggers after a specific time. |
| `on.skip-if-match` | **Skip if condition exists** | Don't run if a certain condition is already met in the repo. |
| `on.skip-if-no-match` | **Skip if condition missing** | Don't run if a certain condition is NOT met in the repo. |
| `on.skip-roles` | **Skip for roles** | Don't run when triggered by users with these repository roles. |
| `on.skip-bots` | **Skip for bots** | Don't run when triggered by these bot accounts. |
| `on.roles` | **Required roles** | Only allow users with these repository roles to trigger the workflow. |
| `on.bots` | **Allowed bots** | Allow specific bots to trigger the workflow even without the required role. |
| `on.manual-approval` | **Require approval** | Someone must approve before the workflow runs. |
| `on.reaction` | **Status reaction** | Emoji reaction the bot adds to show it's working (e.g., rocket, eyes). |
| `on.status-comment` | **Status comments** | Whether to post "started" and "completed" messages on the triggering item. |

### Permissions

| Technical Permission | Plain English Label | What "Read" Means | What "Write" Means |
|---|---|---|---|
| `permissions: contents` | **Repository files** | Can view code and files | Can create, edit, and delete files and branches |
| `permissions: issues` | **Issues** | Can view issues | Can create, edit, close, and label issues |
| `permissions: pull-requests` | **Pull requests** | Can view pull requests | Can create, edit, and close pull requests |
| `permissions: discussions` | **Discussions** | Can view discussions | Can create, edit, and close discussions |
| `permissions: actions` | **Workflow runs** | Can view workflow history | Can manage and re-run workflows |
| `permissions: checks` | **Status checks** | Can view CI/CD results | Can create and update check results |
| `permissions: deployments` | **Deployments** | Can view deployments | Can create and update deployments |
| `permissions: statuses` | **Commit statuses** | Can view commit statuses | Can set commit statuses |
| `permissions: packages` | **Packages** | Can view packages | Can publish packages |
| `permissions: pages` | **GitHub Pages** | Can view Pages settings | Can deploy to GitHub Pages |
| `permissions: security-events` | **Security alerts** | Can view security alerts | Can create and dismiss alerts |
| `permissions: metadata` | **Repository info** | Can view repo details | Can update repo metadata |
| `permissions: models` | **AI models** | Can use GitHub Copilot AI models | N/A |
| `permissions: id-token` | **Identity token** | N/A | Can request an OIDC identity token |
| `permissions: attestations` | **Attestations** | Can view attestations | Can create attestations |
| `permissions: all` | **All permissions** | Read access to everything | N/A (use `write-all` shorthand) |

### Engine Options

| Technical Value | Plain English Label | Description |
|---|---|---|
| `engine: copilot` | **GitHub Copilot** | GitHub's built-in AI assistant - great for general coding tasks |
| `engine: claude` | **Claude (Anthropic)** | Advanced reasoning AI - best for complex analysis and detailed work |
| `engine: codex` | **OpenAI Codex** | OpenAI's code-focused AI - good for code generation |
| `engine.model` | **Model Version** | Which specific version of the AI to use |
| `engine.max-turns` | **Maximum Conversations** | How many back-and-forth exchanges the AI can have before stopping |
| `engine.version` | **Engine Version** | Which version of the engine action to use |

### Tools

| Technical Tool | Plain English Label | Description |
|---|---|---|
| `tools: github` | **GitHub** | Read and interact with your repository (issues, PRs, files, commits) |
| `tools: github: read-only` | **GitHub (Read Only)** | View repository data without making changes |
| `tools: bash` | **Terminal Commands** | Run shell commands on the server |
| `tools: edit` | **File Editor** | Read, create, and modify files in the repository |
| `tools: playwright` | **Web Browser** | Browse websites, take screenshots, and test web pages |
| `tools: web-fetch` | **Web Fetcher** | Download content from websites and APIs |
| `tools: web-search` | **Web Search** | Search the internet for information |
| `tools: cache-memory` | **Persistent Memory** | Remember information across workflow runs |
| `tools: repo-memory` | **Repository Memory** | Store and recall information in a dedicated git branch |
| `tools: serena` | **Code Intelligence** | Advanced code analysis with language-aware understanding |
| `tools: agentic-workflows` | **Workflow Inspector** | Analyze other agentic workflows in the repository |

### Safe Outputs (Actions the Agent Can Take)

| Technical Safe Output | Plain English Label | Description |
|---|---|---|
| `safe-outputs: create-issue` | **Create Issues** | The agent can open new issues in your repository |
| `safe-outputs: add-comment` | **Add Comments** | The agent can post comments on issues and pull requests |
| `safe-outputs: create-pull-request` | **Create Pull Requests** | The agent can create pull requests with code changes |
| `safe-outputs: add-labels` | **Add Labels** | The agent can tag issues or PRs with labels |
| `safe-outputs: remove-labels` | **Remove Labels** | The agent can remove labels from issues or PRs |
| `safe-outputs: close-issue` | **Close Issues** | The agent can close issues when they're resolved |
| `safe-outputs: update-issue` | **Edit Issues** | The agent can modify existing issue titles, descriptions, and metadata |
| `safe-outputs: close-pull-request` | **Close Pull Requests** | The agent can close pull requests |
| `safe-outputs: update-pull-request` | **Edit Pull Requests** | The agent can modify existing PR titles, descriptions, and metadata |
| `safe-outputs: create-pull-request-review-comment` | **Review Code** | The agent can add comments on specific lines of code in PRs |
| `safe-outputs: submit-pull-request-review` | **Submit PR Review** | The agent can approve or request changes on pull requests |
| `safe-outputs: reply-to-pull-request-review-comment` | **Reply to Reviews** | The agent can respond to existing code review comments |
| `safe-outputs: resolve-pull-request-review-thread` | **Resolve Review Threads** | The agent can mark review discussions as resolved |
| `safe-outputs: push-to-pull-request-branch` | **Push Code to PR** | The agent can push commits directly to a PR branch |
| `safe-outputs: mark-pull-request-as-ready-for-review` | **Mark PR Ready** | The agent can mark draft PRs as ready for review |
| `safe-outputs: add-reviewer` | **Request Reviewers** | The agent can assign reviewers to pull requests |
| `safe-outputs: assign-to-user` | **Assign to Person** | The agent can assign issues or PRs to specific people |
| `safe-outputs: assign-to-agent` | **Assign to Copilot** | The agent can assign issues to GitHub Copilot for handling |
| `safe-outputs: unassign-from-user` | **Unassign Person** | The agent can remove assignees from issues or PRs |
| `safe-outputs: assign-milestone` | **Set Milestone** | The agent can assign milestones to issues or PRs |
| `safe-outputs: link-sub-issue` | **Link Sub-Issues** | The agent can create parent-child relationships between issues |
| `safe-outputs: create-discussion` | **Create Discussions** | The agent can start new discussions |
| `safe-outputs: close-discussion` | **Close Discussions** | The agent can close discussions |
| `safe-outputs: update-discussion` | **Edit Discussions** | The agent can modify existing discussions |
| `safe-outputs: create-code-scanning-alert` | **Report Vulnerabilities** | The agent can create security alerts for detected issues |
| `safe-outputs: autofix-code-scanning-alert` | **Auto-fix Security Issues** | The agent can propose fixes for security alerts |
| `safe-outputs: hide-comment` | **Hide Comments** | The agent can minimize irrelevant or outdated comments |
| `safe-outputs: dispatch-workflow` | **Trigger Other Workflows** | The agent can start other workflows in the repository |
| `safe-outputs: upload-asset` | **Upload Files** | The agent can publish images, charts, or reports for persistent storage |
| `safe-outputs: update-release` | **Edit Releases** | The agent can modify release notes and assets |
| `safe-outputs: update-project` | **Update Projects** | The agent can add items and update fields in GitHub Projects |
| `safe-outputs: create-project` | **Create Projects** | The agent can create new GitHub Projects |
| `safe-outputs: create-project-status-update` | **Post Project Updates** | The agent can post progress updates to GitHub Projects |
| `safe-outputs: create-agent-task` | **Create Agent Tasks** | The agent can create tasks for GitHub Copilot |
| `safe-outputs: create-agent-session` | **Start Agent Sessions** | The agent can start new Copilot coding sessions |
| `safe-outputs: missing-tool` | **Report Missing Tools** | The agent can report when a required tool isn't available |
| `safe-outputs: missing-data` | **Report Missing Data** | The agent can report when required information is missing |
| `safe-outputs: noop` | **No Action Needed** | The agent can explicitly say nothing needs to be done |
| `safe-outputs: threat-detection` | **Report Threats** | The agent can flag security threats or suspicious patterns |

### Network Options

| Technical Value | Plain English Label | Description |
|---|---|---|
| `network: defaults` | **Standard access only** | Only essential services (GitHub, AI providers) |
| `network: allowed: [domains]` | **Allow specific websites** | Let the agent access these additional websites |
| `network: blocked: [domains]` | **Block specific websites** | Prevent the agent from accessing these websites |
| `network: firewall: disable` | **No network restrictions** | Turn off all network filtering (not recommended) |

### Reaction Emoji Options

| Technical Value | Emoji | When to Use |
|---|---|---|
| `reaction: eyes` | :eyes: | "I see this, working on it" |
| `reaction: rocket` | :rocket: | "On it! Launching now" |
| `reaction: +1` | :+1: | "Acknowledged" |
| `reaction: heart` | :heart: | "Love this!" |
| `reaction: hooray` | :tada: | "Celebrating!" |
| `reaction: laugh` | :laughing: | "Haha, fun one!" |
| `reaction: confused` | :confused: | "Let me figure this out" |
| `reaction: -1` | :-1: | "Noted, will address" |
| `reaction: none` | (nothing) | Don't add any reaction |

---

## 2. User Personas

### Sarah - Product Manager

- **Role**: Product Manager at a mid-size tech company
- **Technical Level**: Uses GitHub to read issues and PRs; has never written YAML or GitHub Actions
- **Goal**: Auto-triage incoming issues so the right team sees them immediately
- **Pain Points**:
  - Spends 2 hours daily manually labeling and assigning issues
  - Doesn't know which labels to apply to technical issues
  - Has missed urgent bugs because they weren't labeled correctly
- **Needs from the Visual Editor**:
  - Pick a trigger from a dropdown, not type YAML
  - See templates for "issue triage" workflows ready to go
  - Understand what each permission does in plain language
  - Preview what the workflow will do before deploying

### Mike - Team Lead

- **Role**: Engineering Team Lead, manages 8 developers
- **Technical Level**: Writes code daily, uses git, knows basic GitHub Actions but finds YAML tedious
- **Goal**: Automated PR reviews that check for code quality and leave helpful feedback
- **Pain Points**:
  - Reviews 15-20 PRs a week; many have obvious issues he shouldn't need to flag manually
  - Existing CI checks only cover tests, not code quality or style
  - Tried writing a GitHub Action once but gave up on YAML syntax
- **Needs from the Visual Editor**:
  - Quick "PR Review" template he can customize
  - Ability to fine-tune which tools the AI has access to
  - See the generated YAML for his own learning
  - Set up without needing to understand frontmatter syntax

### Lisa - Business Analyst

- **Role**: Business Analyst, works closely with developers
- **Technical Level**: Uses GitHub to file issues and read documentation; has never used Actions or YAML
- **Goal**: Auto-generate documentation from code changes
- **Pain Points**:
  - Documentation is always outdated because devs forget to update it
  - She has to manually check PRs to see if docs need updating
  - Doesn't understand the codebase well enough to write docs herself
- **Needs from the Visual Editor**:
  - A template for "Documentation Generator" she can deploy in minutes
  - No exposure to technical concepts like sandboxing or MCP servers
  - Friendly, jargon-free descriptions for every option
  - Confidence that the AI won't break anything (read-only by default)

---

## 3. User Journeys

### Journey A: "I want to auto-review pull requests"

**Persona**: Mike (Team Lead)

#### Step 1: Landing & Template Selection
- Mike opens the visual editor and sees a **template gallery**
- He clicks **"PR Code Review"** template card
- The editor pre-populates with a visual flow:
  - Trigger node: "When a pull request is opened or updated"
  - Engine node: "GitHub Copilot"
  - Actions node: "Add review comments, Submit review"
- A **preview sidebar** shows: "This workflow reviews new pull requests and leaves feedback on code quality."

#### Step 2: Customize the Trigger
- Mike sees the trigger node says "Pull request opened or updated"
- He clicks it and sees a simple form:
  - **When**: Pull request (pre-selected)
  - **Activity type**: Opened, Synchronized (pre-checked)
  - **Branches** (optional): He types `main` to only review PRs targeting main
- The node updates its label: "When a PR is opened or updated targeting main"

#### Step 3: Choose the AI
- Mike clicks the engine node
- He sees three cards:
  - **GitHub Copilot** (recommended, highlighted) - "Fast and integrated with GitHub"
  - **Claude** - "Best for detailed, nuanced analysis"
  - **Codex** - "Specialized for code generation"
- He selects **Claude** because he wants thorough reviews
- A sub-option appears: **Conversation depth**: "Standard (3 exchanges)" - he keeps the default

#### Step 4: Write Instructions
- The center panel shows a rich text area labeled **"Instructions for the AI"**
- A placeholder reads: *"Tell the AI what to look for when reviewing code..."*
- Mike types:
  ```
  Review this pull request for:
  1. Code quality and readability
  2. Potential bugs or edge cases
  3. Missing error handling
  4. Performance concerns
  Be constructive and suggest specific improvements.
  ```

#### Step 5: Configure What the Agent Can Do
- Mike sees the **"Agent Actions"** panel with toggle switches:
  - **Add review comments** - ON (pre-set by template)
  - **Submit PR review** - ON (pre-set by template)
  - **Add labels** - OFF (he toggles ON, types allowed labels: `needs-review, approved, changes-requested`)
  - **Create issues** - OFF (leaves it)
- He sees a note: "The agent will comment on specific lines of code and submit an overall review."

#### Step 6: Review & Deploy
- Mike clicks **"Preview"** and sees:
  - A summary card: "Trigger: PR opened -> Claude reviews code -> Leaves comments + submits review"
  - The generated YAML (collapsed by default, expandable for learning)
- He clicks **"Save Workflow"**
- He names it `pr-code-review`
- A success toast: "Workflow saved! It will run the next time a PR targets main."

---

### Journey B: "I want to triage and label new issues"

**Persona**: Sarah (Product Manager)

#### Step 1: Start from Scratch
- Sarah opens the visual editor and clicks **"Create New Workflow"**
- She sees a wizard that asks: *"What would you like your workflow to do?"*
- Options presented as cards with icons:
  - "Review pull requests"
  - **"Triage and organize issues"** (she clicks this)
  - "Generate documentation"
  - "Scan for security issues"
  - "Start from scratch"

#### Step 2: Guided Trigger Setup
- The wizard asks: *"When should this run?"*
- Since she chose issue triage, the recommended option is pre-selected:
  - **"When a new issue is created"** (highlighted as recommended)
  - "When an issue is edited"
  - "When someone comments on an issue"
  - "On a schedule"
- She keeps "When a new issue is created" selected and clicks Next

#### Step 3: AI Selection (Simplified)
- The wizard shows: *"Which AI should handle this?"*
- **GitHub Copilot** is pre-selected with a note: "Recommended for issue triage - fast and reliable"
- She keeps the default and clicks Next

#### Step 4: Write Triage Instructions
- The wizard shows a text area: *"What should the AI do with new issues?"*
- A helpful **"Need ideas?"** dropdown shows suggestions:
  - "Classify issues as bug, feature request, or question"
  - "Assign priority labels (critical, high, medium, low)"
  - "Route to the right team based on content"
  - "Add helpful starter comments for contributors"
- Sarah checks the first three and they populate the text area. She customizes:
  ```
  When a new issue comes in:
  1. Read the title and description carefully
  2. Classify it as: bug, feature-request, question, or documentation
  3. Assign a priority: critical, high, medium, or low
  4. If it mentions "login" or "auth", add the "security" label
  5. If it's a bug, ask the author for reproduction steps
  ```

#### Step 5: Configure Labels
- The wizard shows: *"Which labels should the AI be allowed to add?"*
- She types labels: `bug, feature-request, question, documentation, critical, high, medium, low, security`
- A note explains: "The AI can only add labels from this list - it can't create new ones."

#### Step 6: Confirmation
- The wizard shows a summary:
  - **Trigger**: New issue created
  - **AI**: GitHub Copilot
  - **What it does**: Classifies, labels, and comments on new issues
  - **Labels it can add**: bug, feature-request, question, documentation, critical, high, medium, low, security
- She clicks **"Create Workflow"** and names it `issue-triage`
- Success: "Your workflow is ready! Try creating a test issue to see it in action."

---

### Journey C: "I want to generate documentation from code"

**Persona**: Lisa (Business Analyst)

#### Step 1: Template Selection
- Lisa opens the editor and browses templates
- She finds **"Documentation Generator"** and clicks **"Use This Template"**
- A description reads: "Automatically updates documentation when code changes. Reviews PRs and suggests doc updates."

#### Step 2: Review Pre-configured Settings
- The visual editor loads with everything pre-configured:
  - **When**: "When a pull request is opened or updated" (shown as a card, not YAML)
  - **AI**: "Claude - best for writing clear documentation" (pre-selected)
  - **What it can do**: "Add comments suggesting documentation changes" (pre-enabled)
  - **Instructions**: Pre-filled with a template asking the AI to check for missing docs
- Lisa reads the instructions and adjusts one line, replacing "API documentation" with "user guides"

#### Step 3: Adjust Permissions (Guided)
- A sidebar shows **"What the AI can access"** with simple toggles:
  - **View code and files** - ON (required, can't toggle off)
  - **Post comments on PRs** - ON (pre-enabled)
  - **Create new issues** - OFF (she toggles ON to track missing docs)
- A helper note: "Read-only by default. The AI can suggest changes but won't modify code directly."

#### Step 4: Save
- Lisa clicks **"Save"**, names it `doc-checker`
- She sees: "This workflow will comment on PRs when documentation might need updating."

---

### Journey D: "I want to create a security scanning workflow"

**Persona**: Mike (Team Lead)

#### Step 1: Template Selection
- Mike selects the **"Security Scanner"** template
- Description: "Scans code changes for security vulnerabilities and flags potential issues."

#### Step 2: Customize Trigger
- Pre-configured to run on pull requests
- Mike adds a second trigger: **"On a schedule"**
- A scheduling helper appears:
  - Quick options: "Daily", "Weekly", "Monthly"
  - He selects **"Weekly"** -> "Every Monday at 9:00 AM UTC"

#### Step 3: Configure Tools
- The template pre-enables:
  - **GitHub** (read-only) - to scan code
  - **Web Search** - to look up known vulnerabilities
- Mike also enables:
  - **File Editor** - so the AI can suggest fixes inline
  - **Web Fetcher** - to check CVE databases

#### Step 4: Set Up Outputs
- Template pre-configures:
  - **Report vulnerabilities** (code scanning alerts) - ON
  - **Add review comments** - ON
- Mike also enables:
  - **Create issues** - for critical vulnerabilities that need tracking
  - **Add labels** - allowed: `security, vulnerability, critical, high, medium, low`

#### Step 5: Write Instructions
- Mike edits the pre-filled security scanning instructions:
  ```
  Scan all code changes for:
  1. SQL injection vulnerabilities
  2. Cross-site scripting (XSS)
  3. Hardcoded secrets or credentials
  4. Insecure dependencies
  5. Missing input validation

  For each finding:
  - Comment on the specific line of code
  - Rate severity: critical, high, medium, or low
  - Suggest a fix
  - Create an issue for critical/high findings
  ```

#### Step 6: Advanced Settings
- Mike clicks **"Show Advanced Options"** (progressive disclosure)
- He sees:
  - **Internet Access**: He adds `nvd.nist.gov` to allowed domains (for CVE lookups)
  - **Time Limit**: Sets to 30 minutes
  - **Overlap Handling**: "Cancel previous run" (so only latest PR gets scanned)

#### Step 7: Save & Deploy
- Reviews the summary and deploys as `security-scan`

---

### Journey E: "I want to start from a template and customize it"

**Persona**: Sarah (Product Manager)

#### Step 1: Browse Template Gallery
- Sarah opens the editor and sees the template gallery as a grid of cards:
  - Each card shows: icon, name, 1-line description, AI engine badge, trigger badge
  - Cards are grouped: "Popular", "Issues & Triage", "Pull Requests", "Documentation", "Security", "Custom"
- She browses "Issues & Triage" and sees:
  - "Issue Triage Bot" - "Classify and label new issues automatically"
  - "Stale Issue Cleanup" - "Close issues with no activity after 30 days"
  - "Issue to PR" - "Automatically create a PR to fix an issue"

#### Step 2: Preview Template
- She hovers over **"Stale Issue Cleanup"** and clicks **"Preview"**
- A modal shows:
  - **Description**: "Finds issues with no activity for 30 days, warns the author, and closes after 7 more days of inactivity."
  - **Runs**: On a daily schedule
  - **AI**: GitHub Copilot
  - **Actions**: Add comment, Add labels, Close issues
  - **Visual flow diagram**: Schedule -> Copilot -> Check issues -> Warn or Close

#### Step 3: Use Template
- She clicks **"Use This Template"**
- The editor loads with the template fully configured
- She wants to customize:
  - Changes "30 days" to "14 days" in the instructions
  - Adds a label `stale` to the allowed labels list
  - Enables the **"Status comments"** toggle so the bot posts a message when it starts

#### Step 4: Test & Save
- She clicks **"Preview Output"** to see what the compiled workflow looks like
- Everything looks good. She clicks **"Save"** and names it `stale-issues`

---

## 4. Template Definitions

### Template 1: PR Code Review

| Property | Value |
|---|---|
| **Name** | PR Code Review |
| **Description** | Automatically review pull requests for code quality, bugs, and best practices |
| **Icon** | `CodeReviewIcon` (magnifying glass over code) |
| **Category** | Pull Requests |

**Pre-configured frontmatter:**
```yaml
on:
  pull_request:
    types: [opened, synchronize]
engine: copilot
permissions:
  contents: read
  pull-requests: read
tools:
  github:
    read-only: true
  edit:
safe-outputs:
  create-pull-request-review-comment:
  submit-pull-request-review:
  add-labels:
    allowed: [needs-changes, approved, needs-review]
```

**Default instruction text:**
```
Review this pull request for code quality, potential bugs, and best practices.
For each issue found, leave a specific comment on the relevant line of code.
Submit an overall review with your assessment.
```

**Included nodes:** Trigger (pull_request), Engine (copilot), Tools (github read-only, edit), Safe Outputs (review-comment, submit-review, add-labels)

---

### Template 2: Issue Triage Bot

| Property | Value |
|---|---|
| **Name** | Issue Triage Bot |
| **Description** | Automatically classify, label, and route new issues to the right team |
| **Icon** | `TriageIcon` (inbox with sorting arrows) |
| **Category** | Issues & Triage |

**Pre-configured frontmatter:**
```yaml
on:
  issues:
    types: [opened]
  reaction: eyes
engine: copilot
permissions:
  issues: read
tools:
  github:
    read-only: true
safe-outputs:
  add-labels:
    allowed: [bug, feature-request, question, documentation, good-first-issue]
  add-comment:
    max: 1
```

**Default instruction text:**
```
When a new issue is created:
1. Read the title and description carefully
2. Classify the issue as: bug, feature-request, question, or documentation
3. If it looks like a good first issue for new contributors, also add "good-first-issue"
4. Add a brief comment acknowledging the issue and explaining the classification
```

**Included nodes:** Trigger (issues.opened), Engine (copilot), Tools (github read-only), Safe Outputs (add-labels, add-comment)

---

### Template 3: Documentation Generator

| Property | Value |
|---|---|
| **Name** | Documentation Generator |
| **Description** | Review code changes and suggest documentation updates |
| **Icon** | `DocsIcon` (book with pencil) |
| **Category** | Documentation |

**Pre-configured frontmatter:**
```yaml
on:
  pull_request:
    types: [opened, synchronize]
engine: claude
permissions:
  contents: read
  pull-requests: read
tools:
  github:
    read-only: true
  edit:
safe-outputs:
  add-comment:
    max: 1
  create-pull-request-review-comment:
```

**Default instruction text:**
```
Review this pull request and check if any documentation needs to be updated.
Look for:
1. New functions or classes that need docstrings
2. Changed APIs that affect existing documentation
3. New features that should be mentioned in README or docs
4. Breaking changes that need migration guides

If documentation updates are needed, comment on the specific code that needs docs
and suggest what documentation should be added or changed.
```

**Included nodes:** Trigger (pull_request), Engine (claude), Tools (github read-only, edit), Safe Outputs (add-comment, review-comment)

---

### Template 4: Security Scanner

| Property | Value |
|---|---|
| **Name** | Security Scanner |
| **Description** | Scan code changes for vulnerabilities and security issues |
| **Icon** | `SecurityIcon` (shield with checkmark) |
| **Category** | Security |

**Pre-configured frontmatter:**
```yaml
on:
  pull_request:
    types: [opened, synchronize]
engine: claude
permissions:
  contents: read
  pull-requests: read
  security-events: write
tools:
  github:
    read-only: true
  edit:
  web-search:
safe-outputs:
  create-pull-request-review-comment:
  create-code-scanning-alert:
  add-labels:
    allowed: [security, vulnerability]
network:
  allowed:
    - defaults
```

**Default instruction text:**
```
Scan this pull request for security vulnerabilities:
1. Look for SQL injection, XSS, and command injection risks
2. Check for hardcoded secrets or credentials
3. Identify insecure dependencies
4. Flag missing input validation
5. Check for OWASP Top 10 issues

For each finding, comment on the specific line and suggest a fix.
Create a security alert for critical or high severity issues.
```

**Included nodes:** Trigger (pull_request), Engine (claude), Tools (github read-only, edit, web-search), Safe Outputs (review-comment, code-scanning-alert, add-labels), Network (defaults)

---

### Template 5: Stale Issue Cleanup

| Property | Value |
|---|---|
| **Name** | Stale Issue Cleanup |
| **Description** | Automatically warn and close issues with no recent activity |
| **Icon** | `CleanupIcon` (broom or clock) |
| **Category** | Issues & Triage |

**Pre-configured frontmatter:**
```yaml
on:
  schedule: daily
engine: copilot
permissions:
  issues: read
tools:
  github:
    read-only: true
safe-outputs:
  add-comment:
    max: 10
  add-labels:
    allowed: [stale, inactive]
  close-issue:
```

**Default instruction text:**
```
Search for issues that have had no activity in the last 30 days.
For each stale issue:
1. If it hasn't been warned yet, add the "stale" label and post a comment:
   "This issue has been inactive for 30 days. It will be closed in 7 days if no further activity occurs."
2. If it already has the "stale" label and still has no activity after 7 more days, close it with a comment:
   "Closing due to inactivity. Feel free to reopen if this is still relevant."
3. If a stale issue gets new activity, remove the "stale" label.
```

**Included nodes:** Trigger (schedule), Engine (copilot), Tools (github read-only), Safe Outputs (add-comment, add-labels, close-issue)

---

### Template 6: Slash Command Bot

| Property | Value |
|---|---|
| **Name** | Slash Command Bot |
| **Description** | Create a custom bot that responds to /commands in issue and PR comments |
| **Icon** | `CommandIcon` (terminal prompt) |
| **Category** | Custom |

**Pre-configured frontmatter:**
```yaml
on:
  slash_command:
  reaction: rocket
  status-comment: true
engine: copilot
permissions:
  contents: read
  issues: read
tools:
  github:
safe-outputs:
  add-comment:
  add-labels:
    allowed: []
```

**Default instruction text:**
```
You are a helpful bot that responds to slash commands.
When someone uses your command, read their request and respond helpfully.
Add a comment with your response on the issue or PR where the command was used.
```

**Included nodes:** Trigger (slash_command), Engine (copilot), Tools (github), Safe Outputs (add-comment, add-labels)

---

### Template 7: Release Notes Generator

| Property | Value |
|---|---|
| **Name** | Release Notes Generator |
| **Description** | Automatically generate and update release notes when a new release is published |
| **Icon** | `ReleaseIcon` (tag with sparkle) |
| **Category** | Documentation |

**Pre-configured frontmatter:**
```yaml
on:
  release:
    types: [published]
engine: claude
permissions:
  contents: read
tools:
  github:
    read-only: true
safe-outputs:
  update-release:
  add-comment:
```

**Default instruction text:**
```
A new release has been published. Generate comprehensive release notes by:
1. Listing all commits since the last release
2. Grouping changes by type: Features, Bug Fixes, Improvements, Breaking Changes
3. Highlighting notable changes with brief descriptions
4. Thanking contributors by name
5. Update the release body with the generated notes
```

**Included nodes:** Trigger (release), Engine (claude), Tools (github read-only), Safe Outputs (update-release, add-comment)

---

### Template 8: Scheduled Report

| Property | Value |
|---|---|
| **Name** | Weekly Status Report |
| **Description** | Generate a weekly summary of repository activity and post it as a discussion |
| **Icon** | `ReportIcon` (chart with calendar) |
| **Category** | Custom |

**Pre-configured frontmatter:**
```yaml
on:
  schedule: every monday at 9am
engine: copilot
permissions:
  contents: read
  issues: read
  pull-requests: read
  discussions: read
tools:
  github:
    read-only: true
safe-outputs:
  create-discussion:
  create-issue:
```

**Default instruction text:**
```
Generate a weekly status report for the repository covering the last 7 days:

1. **Issues**: How many opened, closed, and still open
2. **Pull Requests**: How many opened, merged, and still open
3. **Top Contributors**: Who was most active this week
4. **Notable Changes**: Summarize the most important merged PRs
5. **Open Items**: List high-priority issues that need attention

Create a discussion in the "General" category with the report.
```

**Included nodes:** Trigger (schedule), Engine (copilot), Tools (github read-only), Safe Outputs (create-discussion, create-issue)

---

## 5. Progressive Disclosure Strategy

### Level 1: Basic (Default View)

What the user sees when they first create or edit a workflow. This covers 80% of use cases.

| Section | Fields Shown | UI Component |
|---|---|---|
| **When to Run** | Trigger type dropdown + activity type checkboxes | Card with dropdown |
| **AI Assistant** | Engine selection (3 cards: Copilot, Claude, Codex) | Card selector |
| **Instructions** | Rich text editor for the AI prompt | Text area |
| **What the Agent Can Do** | Toggle switches for common safe outputs (create-issue, add-comment, add-labels, create-pull-request) | Toggle list |

**Hidden at Level 1:** Tools, Permissions, Network, Sandbox, MCP Servers, Steps, Concurrency, Environment, Cache, Secrets, Advanced Trigger options, Rate Limit, Plugins

**Transition to Level 2:** A subtle link at the bottom: "Show more options" or individual "Customize" links next to auto-configured sections.

---

### Level 2: Intermediate

Shown when user clicks "Show more options". Adds tools and permissions.

| Section | Fields Shown | UI Component |
|---|---|---|
| **Tools & Capabilities** | Toggle switches for each tool (github, edit, bash, playwright, web-fetch, web-search, cache-memory) | Toggle list with descriptions |
| **Permissions** | Grid of permission scopes with read/write/none toggles | Permission grid |
| **Trigger Options** | Reaction emoji, status comments, skip conditions, required roles | Expandable form |
| **Additional Outputs** | Less common safe outputs (close-issue, update-issue, assign, review threads, etc.) | Toggle list |
| **Time Limit** | Timeout slider | Slider (5-60 min) |
| **Overlap Handling** | Concurrency toggle + cancel-in-progress | Toggle + checkbox |

**Hidden at Level 2:** Network rules, Sandbox config, MCP Servers, Steps, Environment variables, Cache, Secrets, Plugins, Rate Limit, Advanced sandbox

**Transition to Level 3:** "Show advanced options" link or gear icon.

---

### Level 3: Advanced

For power users who need full control. Everything is visible.

| Section | Fields Shown | UI Component |
|---|---|---|
| **Network Rules** | Allowed/blocked domains list, firewall config | Domain list editor |
| **Security Sandbox** | Sandbox type, filesystem restrictions, nested sandbox | Advanced form |
| **MCP Servers** | Custom MCP server definitions | Key-value editor |
| **Custom Steps** | Before/after steps | Code editor blocks |
| **Environment Variables** | Key-value env vars | Key-value editor |
| **Cache Configuration** | Cache keys, paths, restore keys | Form fields |
| **Secrets** | Secret references | Masked input fields |
| **Rate Limiting** | Max runs, time window, exempt roles | Number inputs |
| **Plugins** | Plugin repos, custom tokens | List editor |
| **Custom Run Name** | Run name template | Text input |
| **Runner Type** | Runs-on selector | Dropdown |
| **Imports** | Shared workflow imports | File picker |
| **Strict Mode** | Enable/disable | Toggle |
| **Custom Safe Inputs** | JavaScript/shell script tools | Code editor |
| **Runtime Versions** | Language version overrides | Key-value editor |
| **Secret Masking** | Custom redaction steps | Step editor |
| **Manual Approval** | Environment for approval gates | Text input |

### Transition UX Between Levels

1. **Expand/Collapse**: Each section has a disclosure triangle. Level 2 sections start collapsed. Level 3 sections show a "Show advanced" link that reveals them.

2. **Smart Notifications**: When the system auto-configures something at a hidden level (e.g., setting permissions based on safe-outputs), a small info badge appears: "Auto-configured: 2 permissions set based on your actions"

3. **No Data Loss**: Collapsing a section never clears its data. If a user sets advanced options then collapses, the values persist.

4. **Visual Indicators**: Sections with non-default values show a small dot indicator even when collapsed, so users know something is configured there.

5. **Contextual Reveal**: When the user enables a feature that requires advanced settings (e.g., enabling Playwright requires network configuration), the relevant advanced section auto-expands with a highlight.

---

## 6. Smart Defaults

When a user selects certain options, the editor should automatically configure related settings. These can always be overridden.

### By Engine Selection

| Engine Selected | Auto-configured |
|---|---|
| **Copilot** | `permissions: models: read` (required), `tools: github: mode: remote` |
| **Claude** | `engine.max-turns: 3`, `sandbox: awf` |
| **Codex** | `engine.max-turns: 3`, `sandbox: awf` |

### By Trigger Selection

| Trigger Selected | Auto-configured |
|---|---|
| **issues** | `permissions: issues: read`, suggest `safe-outputs: add-comment, add-labels` |
| **pull_request** | `permissions: contents: read, pull-requests: read`, suggest `safe-outputs: create-pull-request-review-comment` |
| **issue_comment** | `permissions: issues: read`, suggest `safe-outputs: add-comment` |
| **schedule** | No special permissions needed, suggest `safe-outputs: create-issue` |
| **release** | `permissions: contents: read`, suggest `safe-outputs: update-release` |
| **discussion** | `permissions: discussions: read`, suggest `safe-outputs: add-comment` |
| **slash_command** | Same as issue_comment, auto-add `reaction: rocket` |

### By Safe Output Selection

| Safe Output Enabled | Auto-configured Permissions |
|---|---|
| **create-issue** | `permissions: issues: read` (safe-outputs handles write) |
| **add-comment** | `permissions: issues: read` or `pull-requests: read` |
| **create-pull-request** | `permissions: contents: read` |
| **add-labels** | `permissions: issues: read` or `pull-requests: read` |
| **close-issue** | `permissions: issues: read` |
| **create-pull-request-review-comment** | `permissions: pull-requests: read` |
| **submit-pull-request-review** | `permissions: pull-requests: read` |
| **create-code-scanning-alert** | `permissions: security-events: write` |
| **create-discussion** | `permissions: discussions: read` |
| **update-release** | `permissions: contents: read` |
| **push-to-pull-request-branch** | `permissions: contents: write` |
| **dispatch-workflow** | `permissions: actions: write` |

### By Tool Selection

| Tool Enabled | Auto-configured |
|---|---|
| **github** | `permissions: contents: read` (minimum), `network.allowed: defaults` |
| **playwright** | Add Playwright container domains to `network.allowed`, suggest setting `timeout-minutes: 15` or higher |
| **web-fetch** | Suggest adding domains to `network.allowed` |
| **web-search** | `network.allowed: defaults` (search APIs) |
| **cache-memory** | No special permissions needed |
| **serena** | `tools: github` (also enabled), `network.allowed: defaults` |

### Network Smart Defaults

- If only `github` and `edit` tools are enabled: `network: defaults` (minimal access)
- If `web-fetch` or `web-search` is enabled: Prompt user to specify allowed domains
- If `playwright` is enabled: Auto-add playwright infrastructure domains
- If no tools require external access: Suggest `network: defaults`

---

## 7. Validation Messages

All error and warning messages in plain English with no technical jargon.

### Trigger Validation

| Condition | User-Friendly Message |
|---|---|
| No trigger selected | "Choose when this workflow should run. For example, 'When a new issue is created' or 'On a schedule'." |
| Invalid cron expression | "That schedule doesn't look right. Try something like 'Every Monday at 9 AM' or 'Daily at midnight'." |
| Schedule too frequent (< 5 min) | "Workflows can run at most every 5 minutes. Try a less frequent schedule." |
| Slash command name missing | "Give your bot command a name, like '/review' or '/triage'." |
| Slash command name has spaces | "Command names can't have spaces. Try using a hyphen instead, like '/my-bot'." |
| No activity types selected | "Select at least one activity type. For example, check 'opened' to run when new items are created." |

### Engine Validation

| Condition | User-Friendly Message |
|---|---|
| No engine selected | "Choose an AI assistant to power your workflow. We recommend GitHub Copilot for most use cases." |
| Max turns set to 0 | "The AI needs at least 1 conversation turn to do its work." |
| Max turns very high (>20) | "More than 20 conversation turns may cause long run times and higher costs. Are you sure?" |
| Model name unrecognized | "We don't recognize that model name. Check the spelling or leave blank to use the default." |

### Permissions Validation

| Condition | User-Friendly Message |
|---|---|
| Missing permission for safe output | "To let the AI [action], it needs permission to view [resource]. We've added this for you." |
| Write permission without corresponding safe output | "You've given the AI write access to [resource], but it has no actions that use it. Did you mean to add an action?" |
| `id-token: read` selected | "Identity tokens only support 'write' or 'none'. Read access isn't available for this permission." |
| All permissions set to write | "Giving the AI write access to everything is not recommended. Consider limiting permissions to only what's needed." |

### Instructions Validation

| Condition | User-Friendly Message |
|---|---|
| No instructions provided | "Tell the AI what to do! Without instructions, it won't know what actions to take." |
| Instructions very short (<20 chars) | "Your instructions seem very brief. The more detail you provide, the better the AI will perform." |
| Instructions very long (>10000 chars) | "Your instructions are quite long. Consider breaking them into shorter, clearer sections." |

### Safe Outputs Validation

| Condition | User-Friendly Message |
|---|---|
| No safe outputs enabled | "The AI doesn't have permission to take any actions. Enable at least one action (like 'Add Comments') or the workflow won't produce any visible results." |
| add-labels with empty allowed list | "Specify which labels the AI can add. This prevents it from creating unexpected labels." |
| add-labels with invalid label name | "Label names can't contain special characters. Use letters, numbers, and hyphens only." |
| create-issue with no title-prefix | "Consider adding a title prefix (like '[Bot]') so issues created by this workflow are easy to identify." |
| create-pull-request with draft:false and no reviewers | "Pull requests created by the AI won't have reviewers assigned. Consider adding reviewers or creating as draft." |
| max set to 0 | "Setting the maximum to 0 means the AI can never perform this action. Did you mean to disable it instead?" |

### Tools Validation

| Condition | User-Friendly Message |
|---|---|
| bash with no restrictions | "The terminal command tool has no restrictions. Consider specifying which commands are allowed for better security." |
| playwright with no allowed_domains | "The web browser tool can access any website. Consider limiting which sites it can visit." |
| github tool disabled but safe outputs need it | "Some of the agent's actions need GitHub access to work. We've enabled the GitHub tool for you." |

### Network Validation

| Condition | User-Friendly Message |
|---|---|
| No network access with web tools enabled | "You've enabled web tools but blocked all internet access. The web tools won't work without network access." |
| Domain format invalid | "That doesn't look like a valid website address. Try something like 'api.example.com' or '*.example.com'." |
| Wildcard too broad (e.g., `*.*`) | "That would allow access to every website. Try being more specific, like '*.github.com'." |
| Blocked domain conflicts with allowed | "'example.com' is both allowed and blocked. Remove it from one list to resolve the conflict." |

### Sandbox Validation

| Condition | User-Friendly Message |
|---|---|
| Sandbox disabled | "Running without a security sandbox is not recommended. The sandbox protects your repository from unintended changes." |
| Filesystem deny pattern invalid | "That file path pattern doesn't look right. Use paths like '/etc/**' or '*.env'." |

### General Validation

| Condition | User-Friendly Message |
|---|---|
| Workflow name empty | "Give your workflow a name so you can find it later." |
| Workflow name has invalid characters | "Workflow names can only contain letters, numbers, and hyphens." |
| Workflow name too long (>100 chars) | "That name is quite long. Try to keep it under 100 characters." |
| Timeout too short (<1 min) | "One minute may not be enough time for the AI to finish. We recommend at least 5 minutes." |
| Timeout too long (>360 min) | "Workflows can run for a maximum of 6 hours (360 minutes)." |
| Rate limit max is 0 | "A rate limit of 0 means no one can trigger this workflow. Set it to at least 1." |
| Rate limit window is 0 | "The time window must be at least 1 minute." |
| Tracker ID too short (<8 chars) | "Tracking IDs must be at least 8 characters long to be unique." |
| Tracker ID has special characters | "Tracking IDs can only contain letters, numbers, hyphens, and underscores." |
| Duplicate workflow name in repo | "A workflow with this name already exists. Choose a different name or edit the existing one." |
| Compilation error (generic) | "Something went wrong while building your workflow. Check the highlighted fields for issues." |

### Contextual Help Tooltips

These short tooltips appear when hovering over field labels or info icons:

| Field | Tooltip |
|---|---|
| **When to Run** | "Events in your GitHub repository that will start this workflow automatically." |
| **AI Assistant** | "The AI model that reads your instructions and takes action. Different models have different strengths." |
| **Instructions** | "Write what you want the AI to do in plain English. Be specific about what to look for and how to respond." |
| **What the Agent Can Do** | "These are the actions the AI is allowed to take. It can only do what you enable here." |
| **Tools** | "Capabilities you give to the AI. For example, 'GitHub' lets it read your code, and 'Web Browser' lets it visit websites." |
| **Permissions** | "Controls what parts of your repository the AI can see and change. Start with read-only and add write access only if needed." |
| **Internet Access** | "Which websites the AI can connect to. By default, only essential services are allowed." |
| **Security Sandbox** | "A secure container that prevents the AI from accessing anything outside your workflow. Always recommended." |
| **Overlap Handling** | "What happens if this workflow triggers again while it's already running." |
| **Time Limit** | "The workflow stops automatically after this many minutes, even if it's not done." |
| **Status Reaction** | "An emoji the bot adds to show it received the trigger and is working on it." |
| **Status Comments** | "Posts a comment when the workflow starts and finishes, so you know what's happening." |
| **Required Roles** | "Only users with these repository access levels can trigger the workflow." |
| **Require Approval** | "A team member must approve before the workflow runs. Good for sensitive operations." |

---

## Appendix: Field Visibility by Disclosure Level

Quick reference for which fields appear at each progressive disclosure level.

| Field | Level 1 (Basic) | Level 2 (Intermediate) | Level 3 (Advanced) |
|---|---|---|---|
| name | Shown | Shown | Shown |
| on (trigger type) | Shown | Shown | Shown |
| on (activity types) | Shown | Shown | Shown |
| on (branches/paths) | Hidden | Shown | Shown |
| on (reaction) | Hidden | Shown | Shown |
| on (status-comment) | Hidden | Shown | Shown |
| on (roles/skip-roles) | Hidden | Hidden | Shown |
| on (bots/skip-bots) | Hidden | Hidden | Shown |
| on (manual-approval) | Hidden | Hidden | Shown |
| on (stop-after) | Hidden | Hidden | Shown |
| on (skip-if-match/no-match) | Hidden | Hidden | Shown |
| engine (type) | Shown | Shown | Shown |
| engine (model) | Hidden | Shown | Shown |
| engine (max-turns) | Hidden | Shown | Shown |
| engine (version) | Hidden | Hidden | Shown |
| engine (command) | Hidden | Hidden | Shown |
| engine (args) | Hidden | Hidden | Shown |
| engine (env) | Hidden | Hidden | Shown |
| engine (config) | Hidden | Hidden | Shown |
| Instructions (markdown body) | Shown | Shown | Shown |
| permissions | Auto-configured | Shown | Shown |
| tools | Auto-configured | Shown | Shown |
| safe-outputs (common) | Shown | Shown | Shown |
| safe-outputs (all) | Hidden | Shown | Shown |
| safe-outputs (config options) | Hidden | Hidden | Shown |
| network | Auto-configured | Hidden | Shown |
| sandbox | Auto-configured | Hidden | Shown |
| timeout-minutes | Hidden | Shown | Shown |
| concurrency | Hidden | Shown | Shown |
| env | Hidden | Hidden | Shown |
| cache | Hidden | Hidden | Shown |
| steps / post-steps | Hidden | Hidden | Shown |
| mcp-servers | Hidden | Hidden | Shown |
| imports | Hidden | Hidden | Shown |
| secrets | Hidden | Hidden | Shown |
| secret-masking | Hidden | Hidden | Shown |
| rate-limit | Hidden | Hidden | Shown |
| plugins | Hidden | Hidden | Shown |
| safe-inputs | Hidden | Hidden | Shown |
| runtimes | Hidden | Hidden | Shown |
| strict | Hidden | Hidden | Shown |
| if | Hidden | Hidden | Shown |
| run-name | Hidden | Hidden | Shown |
| runs-on | Hidden | Hidden | Shown |
| container | Hidden | Hidden | Shown |
| services | Hidden | Hidden | Shown |
| labels | Hidden | Hidden | Shown |
| tracker-id | Hidden | Hidden | Shown |
| source | Hidden | Hidden | Shown |
| description | Hidden | Shown | Shown |
| bots | Hidden | Hidden | Shown |
| jobs | Hidden | Hidden | Shown |
