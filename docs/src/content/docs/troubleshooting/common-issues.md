---
title: Common Issues
description: Frequently encountered issues when working with GitHub Agentic Workflows and their solutions.
sidebar:
  order: 200
---

This reference documents frequently encountered issues when working with GitHub Agentic Workflows, organized by workflow stage and component.

## Installation Issues

### Extension Installation Fails

If `gh extension install github/gh-aw` fails, use the standalone installer (works in Codespaces and restricted networks):

```bash wrap
curl -sL https://raw.githubusercontent.com/github/gh-aw/main/install-gh-aw.sh | bash
```

For specific versions, pass the tag as an argument ([see releases](https://github.com/github/gh-aw/releases)):

```bash wrap
curl -sL https://raw.githubusercontent.com/github/gh-aw/main/install-gh-aw.sh | bash -s -- v0.40.0
```

Verify with `gh extension list`.

## Organization Policy Issues

### Custom Actions Not Allowed in Enterprise Organizations

**Error Message:**

```text
The action github/gh-aw/actions/setup@a933c835b5e2d12ae4dead665a0fdba420a2d421 is not allowed in {ORG} because all actions must be from a repository owned by your enterprise, created by GitHub, or verified in the GitHub Marketplace.
```

Enterprise policies restrict which Actions can be used. An admin must allow `github/gh-aw`:

- **In the UI** (recommended): Go to `https://github.com/organizations/YOUR_ORG/settings/actions`, select **Allow select actions and reusable workflows**, and add `github/gh-aw@*`. See [managing Actions permissions](https://docs.github.com/en/organizations/managing-organization-settings/disabling-or-limiting-github-actions-for-your-organization#allowing-select-actions-and-reusable-workflows-to-run).
- **Via policy file**: Add to `policies/actions.yml` in your org's `.github` repository:
  ```yaml
  allowed_actions:
    - "actions/*"
    - "github/gh-aw@*"
  ```

Wait a few minutes for policy propagation, then re-run.

> [!TIP]
> The gh-aw actions are open source at [github.com/github/gh-aw/tree/main/actions](https://github.com/github/gh-aw/tree/main/actions) and pinned to specific SHAs for security.

## Repository Configuration Issues

### Actions Restrictions Reported During Init

The CLI validates three permission layers. Fix restrictions in Repository Settings → Actions → General:

1. **Actions disabled**: Enable Actions ([docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository))
2. **Local-only**: Switch to "Allow all actions" or enable GitHub-created actions ([docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#managing-github-actions-permissions-for-your-repository))
3. **Selective allowlist**: Enable "Allow actions created by GitHub" checkbox ([docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#allowing-select-actions-and-reusable-workflows-to-run))

> [!NOTE]
> Organization policies override repository settings. Contact admins if settings are grayed out.

## Workflow Compilation Issues

### Workflow Won't Compile

Check YAML frontmatter syntax (indentation, colons with spaces), verify required fields (`on:`), and ensure types match the schema. Use `gh aw compile --verbose` for details.

### Lock File Not Generated

Fix compilation errors (`gh aw compile 2>&1 | grep -i error`) and verify write permissions on `.github/workflows/`.

### Orphaned Lock Files

Remove old `.lock.yml` files with `gh aw compile --purge` after deleting `.md` workflow files.

## Import and Include Issues

### Import File Not Found

Import paths are relative to repository root. Verify with `git status` (e.g., `.github/workflows/shared/tools.md`).

### Multiple Agent Files Error

Import only one `.github/agents/` file per workflow.

### Circular Import Dependencies

Compilation hangs indicate circular imports. Remove circular references.

## Tool Configuration Issues

### GitHub Tools Not Available

Configure using `toolsets:` ([tools reference](/gh-aw/reference/github-tools/)):

```yaml wrap
tools:
  github:
    toolsets: [repos, issues]
```

### Toolset Missing Expected Tools

Check [GitHub Toolsets](/gh-aw/reference/github-tools/), combine toolsets (`toolsets: [default, actions]`), or inspect with `gh aw mcp inspect <workflow>`.

### MCP Server Connection Failures

Verify package installation, syntax, and environment variables:

```yaml
mcp-servers:
  my-server:
    command: "npx"
    args: ["@myorg/mcp-server"]
    env:
      API_KEY: "${{ secrets.MCP_API_KEY }}"
```

### Playwright Network Access Denied

Add domains to `network.allowed`:

```yaml wrap
network:
  allowed:
    - github.com
    - "*.github.io"
```

### Cannot Find Module 'playwright'

Playwright is provided as MCP tools, not an npm package. Use `mcp__playwright__browser_navigate`, `mcp__playwright__browser_snapshot`, etc. instead of `require('playwright')`. See [Playwright Tool documentation](/gh-aw/reference/tools/#playwright-tool-playwright).

### Playwright MCP Initialization Failure (EOF Error)

`Failed to register tools error="initialize: EOF" name=playwright` — Chromium crashes before tool registration due to missing Docker security flags. Upgrade to version 0.41.0+: `gh extension upgrade gh-aw`.

## Permission Issues

### Write Operations Fail

Use safe outputs or request new safe output types.

### Safe Outputs Not Creating Issues

Disable staged mode:

```yaml wrap
safe-outputs:
  staged: false
  create-issue:
    title-prefix: "[bot] "
    labels: [automation]
```

### Token Permission Errors

Grant permissions or use a custom token:

```yaml wrap
permissions:
  contents: write
  issues: write

# Alternative: custom token
safe-outputs:
  github-token: ${{ secrets.CUSTOM_PAT }}
```

### Project Field Type Errors

GitHub Projects reserves field names like `REPOSITORY`. Use alternatives (`repo`, `source_repository`, `linked_repo`):

```yaml wrap
# ❌ Wrong: repository
# ✅ Correct: repo
safe-outputs:
  update-project:
    fields:
      repo: "myorg/myrepo"
```

Delete conflicting fields in Projects UI and recreate.

## Engine-Specific Issues

### Copilot CLI Not Found

Verify compilation succeeded. Compiled workflows include CLI installation steps.

### Model Not Available

Use default (`engine: copilot`) or specify available model (`engine: {id: copilot, model: gpt-4}`).

### Copilot License or Inference Access Issues

If the workflow fails with authentication or quota errors during Copilot inference, the `COPILOT_GITHUB_TOKEN` owner may lack a valid Copilot license or inference access.

Verify locally by exporting the token and running `copilot -p "write a haiku"` (requires the [Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli)). If that fails, contact your org admin — the token must belong to a user with an active Copilot subscription. Organization-managed licenses may restrict programmatic API access.

## Context Expression Issues

### Unauthorized Expression

Use only [allowed expressions](/gh-aw/reference/templating/) (`github.event.issue.number`, `github.repository`, `needs.activation.outputs.text`). Disallowed: `secrets.*`, `env.*`.

### Sanitized Context Empty

`needs.activation.outputs.text` requires issue/PR/comment events (`on: issues:`), not `push:` or similar triggers.

## Build and Test Issues

### Documentation Build Fails

Clean install and rebuild:

```bash wrap
cd docs
rm -rf node_modules package-lock.json
npm install
npm run build
```

Check for malformed frontmatter, MDX syntax errors, or broken links.

### Tests Failing After Changes

Format and lint before testing:

```bash wrap
make fmt
make lint
make test-unit
```

## Network and Connectivity Issues

### Firewall Denials for Package Registries

Add ecosystem identifiers ([Network Configuration Guide](/gh-aw/guides/network-configuration/)):

```yaml wrap
network:
  allowed:
    - defaults    # Infrastructure
    - python      # PyPI
    - node        # npm
    - containers  # Docker
    - go          # Go modules
```

### URLs Appearing as "(redacted)"

Add domains to allowed list ([Network Permissions](/gh-aw/reference/network/)):

```yaml wrap
network:
  allowed:
    - defaults
    - "api.example.com"
```

### Cannot Download Remote Imports

Verify network (`curl -I https://raw.githubusercontent.com/github/gh-aw/main/README.md`) and auth (`gh auth status`).

### MCP Server Connection Timeout

Use local servers (`command: "node"`, `args: ["./server.js"]`).

## Cache Issues

### Cache Not Restoring

Verify key patterns match (caches expire after 7 days):

```yaml wrap
cache:
  key: deps-${{ hashFiles('package-lock.json') }}
  restore-keys: deps-
```

### Cache Memory Not Persisting

Configure cache for memory MCP server:

```yaml wrap
tools:
  cache-memory:
    key: memory-${{ github.workflow }}-${{ github.run_id }}
```

## GitHub Lockdown Mode Blocking Expected Content

Lockdown mode (enabled by default on public repositories) filters content to items from users with push access, which can cause workflows to miss issues, PRs, or comments from external contributors.

For sensitive operations (code generation, web access, secrets), keep lockdown enabled and use separate workflows or manual triggers. To process community contributions in safe workflows (issue triage, spam detection, public dashboards), disable lockdown only if your workflow validates input and uses restrictive safe outputs:

```yaml wrap
tools:
  github:
    lockdown: false
```

See [Lockdown Mode](/gh-aw/reference/lockdown-mode/) for details.

## Workflow Failures and Debugging

### Workflow Job Timed Out

The default timeout is 20 minutes. Increase it in the frontmatter and recompile:

```yaml wrap
---
timeout-minutes: 60
---
```

If the workflow consistently times out, reduce its scope or split it into smaller, focused workflows.

### Debugging a Failing Workflow

Common causes: missing tokens, permission mismatches, network restrictions, disabled tools, or rate limits. To investigate:

- Audit the run: `gh aw audit <run-id>`
- Check logs: `gh aw logs`
- Inspect compiled output: `.lock.yml`
- Enable verbose mode: `gh aw compile --verbose` or set `ACTIONS_STEP_DEBUG = true`
- Check MCP config: `gh aw mcp inspect`
- Ask Copilot Chat: `/agent agentic-workflows debug`

## Operational Runbooks

See [Workflow Health Monitoring Runbook](https://github.com/github/gh-aw/blob/main/.github/aw/runbooks/workflow-health.md) for diagnosing errors.

## Getting Help

Review [reference docs](/gh-aw/reference/workflow-structure/), search [existing issues](https://github.com/github/gh-aw/issues), or create an issue. See [Error Reference](/gh-aw/troubleshooting/errors/) and [Frontmatter Reference](/gh-aw/reference/frontmatter/).
