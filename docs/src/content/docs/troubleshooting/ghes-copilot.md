---
title: GHES Copilot Troubleshooting
description: Troubleshooting guide for Copilot engine issues on GitHub Enterprise Server
sidebar:
  order: 205
---

This runbook provides solutions for common issues when using the Copilot engine with GitHub Enterprise Server (GHES).

## Quick Reference

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| `Error loading models: 400 Bad Request` | Copilot not licensed or API routing issue | Verify enterprise Copilot settings |
| `403 "unauthorized: not licensed to use Copilot"` | No Copilot seat assigned | Assign Copilot seat to PAT owner |
| `403 "Resource not accessible by personal access token"` | Wrong token permissions | Use fine-grained PAT with `copilot_requests:read` |
| Firewall blocks `api.<ghes-host>:443` | GHES domain not in allowlist | Add to `network.allowed` |
| `Could not resolve to a Repository` | `GH_HOST` not configured | Set `GH_HOST` environment variable |
| Wizard PR creation fails | Wizard targets github.com | Use manual `gh pr create` instead |
| `gh aw audit` fails | `GH_HOST` not set for CLI | Run `GH_HOST=<ghes-host> gh aw audit <run-id>` |

## Licensing and Authentication Issues

### Error Loading Models: 400 Bad Request

**Symptom:**

```text
Error loading models: 400 Bad Request
```

**Causes:**

1. Copilot is not licensed at the enterprise level
2. API proxy is routing to the wrong endpoint
3. GHES GitHub Connect is not configured

**Diagnosis:**

1. Verify enterprise Copilot licensing:
   - Navigate to **Site admin** → **Enterprise overview**
   - Check if GitHub Copilot is listed as an enabled feature

2. Check GitHub Connect status:
   - Navigate to **Site admin** → **Settings** → **GitHub Connect**
   - Verify connection shows "Connected"

3. Review workflow logs for API endpoint:
   ```bash
   gh aw logs --run-id <run-id>
   ```
   Look for the API target in the Copilot CLI command

**Solutions:**

1. **Enable Copilot licensing:**
   - Site administrators: Contact GitHub sales to purchase Copilot
   - Enable Copilot in enterprise settings after purchase

2. **Verify API target configuration:**
   ```yaml
   engine:
     id: copilot
     api-target: api.enterprise.githubcopilot.com
   ```

3. **Configure GitHub Connect:**
   - Follow [GitHub's GitHub Connect documentation](https://docs.github.com/en/enterprise-server/admin/configuration/configuring-github-connect)

**Related Issue:** github/gh-aw-firewall#1300

### 403 Unauthorized: Not Licensed to Use Copilot

**Symptom:**

```text
403 Forbidden: unauthorized: not licensed to use Copilot
```

**Cause:**

The account associated with `COPILOT_GITHUB_TOKEN` does not have a Copilot license or seat assigned.

**Diagnosis:**

1. Identify which user account's PAT is configured as `COPILOT_GITHUB_TOKEN`

2. Verify seat assignment:
   - Navigate to **Organization settings** → **Copilot** → **Access**
   - Search for the user account
   - Check if they have Copilot access enabled

**Solutions:**

1. **Assign Copilot seat (Organization Admin):**
   - Go to **Organization settings** → **Copilot** → **Access**
   - Add the user to the Copilot access list
   - Save changes

2. **Enable enterprise Copilot (Site Admin):**
   - Navigate to **Site admin** → **Enterprise overview**
   - Enable GitHub Copilot for the enterprise
   - Configure licensing and seat allocation

3. **Verify PAT belongs to licensed user:**
   - Ensure the secret `COPILOT_GITHUB_TOKEN` uses a PAT from a user with Copilot access
   - If necessary, create a new PAT from a licensed user and update the secret

### 403 Resource Not Accessible by Personal Access Token

**Symptom:**

```text
403 Forbidden: Resource not accessible by personal access token
```

**Cause:**

The personal access token lacks the required permissions for Copilot API access.

**Diagnosis:**

Review the token type and permissions:
- **Fine-grained PAT**: Should have `copilot_requests:read` account permission
- **Classic PAT**: Should have `copilot` scope

**Solutions:**

1. **Create a new fine-grained PAT (recommended):**
   - Go to **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
   - Click **Generate new token**
   - Under **Account permissions**, grant `copilot_requests:read`
   - Generate and copy the token

2. **Update repository secret:**
   - Navigate to **Repository settings** → **Secrets and variables** → **Actions**
   - Update `COPILOT_GITHUB_TOKEN` with the new token value

3. **Alternative: Use classic PAT with copilot scope:**
   - Go to **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
   - Generate new token with `copilot` scope
   - Update `COPILOT_GITHUB_TOKEN` secret

## Network and Connectivity Issues

### Firewall Blocks GHES Domain

**Symptom:**

```text
Firewall blocked: api.github.example.com:443
```

or

```text
dial tcp: lookup api.github.example.com: no such host
```

**Cause:**

The GHES domain is not included in the workflow's `network.allowed` list.

**Diagnosis:**

1. Review workflow frontmatter:
   ```bash
   grep -A 5 "network:" .github/workflows/your-workflow.md
   ```

2. Check workflow logs for blocked domains:
   ```bash
   gh aw logs --run-id <run-id>
   ```

**Solution:**

Add your GHES domains to the `network.allowed` list:

```yaml
network:
  allowed:
    - defaults
    - github.example.com                    # Your GHES web/API domain
    - api.enterprise.githubcopilot.com      # Copilot API endpoint
```

Common GHES domains to include:
- Your GHES instance hostname (e.g., `github.example.com`)
- Any custom API endpoints
- Raw content domains if using GitHub MCP server

### API Endpoint Routing Issues

**Symptom:**

Workflow tries to connect to github.com instead of GHES instance, or uses wrong Copilot API endpoint.

**Cause:**

Missing or incorrect `engine.api-target` configuration.

**Diagnosis:**

1. Check compiled workflow:
   ```bash
   grep "copilot-api-target" .github/workflows/your-workflow.lock.yml
   ```

2. Verify frontmatter configuration:
   ```bash
   grep -A 5 "engine:" .github/workflows/your-workflow.md
   ```

**Solution:**

Configure `api-target` in workflow frontmatter:

```yaml
engine:
  id: copilot
  api-target: api.enterprise.githubcopilot.com
```

After updating, recompile the workflow:
```bash
gh aw compile your-workflow.md
```

## GitHub CLI Issues

### Could Not Resolve to a Repository

**Symptom:**

```text
Could not resolve to a Repository with the name 'owner/repo'
```

**Cause:**

The `gh` CLI is defaulting to github.com instead of the GHES instance.

**Diagnosis:**

Check if `GH_HOST` environment variable is set in workflow configuration.

**Solutions:**

**Option 1: Configure in workflow frontmatter (recommended):**

```yaml
---
jobs:
  agent:
    env:
      GH_HOST: github.example.com    # Your GHES domain
---
```

**Option 2: Add to workflow prompt:**

```markdown
Before running any `gh` commands, configure the GitHub host:

```bash
export GH_HOST=github.example.com
```
```

**Option 3: Use `--hostname` flag in commands:**

Instruct the agent to use `--hostname` with `gh` commands:
```bash
gh issue list --hostname github.example.com
```

### Wizard PR Creation Fails

**Symptom:**

Using `gh aw add` workflow wizard fails when trying to create a pull request, or creates PR on github.com instead of GHES.

**Cause:**

The `gh aw add` wizard currently targets github.com by default and doesn't support GHES instances.

**Solution:**

Use manual workflow creation and PR process:

1. **Create workflow manually:**
   ```bash
   # Create workflow file
   cat > .github/workflows/my-workflow.md <<EOF
   ---
   description: My GHES workflow
   on:
     workflow_dispatch:
   engine:
     id: copilot
     api-target: api.enterprise.githubcopilot.com
   network:
     allowed:
       - defaults
       - github.example.com
       - api.enterprise.githubcopilot.com
   ---

   # Your workflow prompt
   EOF
   ```

2. **Compile the workflow:**
   ```bash
   gh aw compile my-workflow.md
   ```

3. **Create PR manually:**
   ```bash
   git checkout -b add-my-workflow
   git add .github/workflows/my-workflow.md .github/workflows/my-workflow.lock.yml
   git commit -m "Add my-workflow"
   git push -u origin add-my-workflow
   GH_HOST=github.example.com gh pr create --title "Add my-workflow" --body "Description"
   ```

**Related Issue:** github/gh-aw#20875

### gh aw audit Fails on GHES

**Symptom:**

```bash
gh aw audit <run-id>
```

fails with repository or API errors.

**Cause:**

The `gh aw audit` command defaults to github.com.

**Solution:**

Set `GH_HOST` when running `gh aw audit`:

```bash
GH_HOST=github.example.com gh aw audit <run-id>
```

Or export it for the session:
```bash
export GH_HOST=github.example.com
gh aw audit <run-id>
```

## Configuration Best Practices

### Complete GHES Workflow Template

Use this template as a starting point for GHES workflows:

```yaml
---
description: GHES workflow with complete configuration
on:
  issue_comment:
    types: [created]
permissions:
  contents: read
  issues: write
  pull-requests: write
engine:
  id: copilot
  api-target: api.enterprise.githubcopilot.com
tools:
  github:
    mode: remote
    toolsets: [default]
network:
  allowed:
    - defaults
    - github.example.com                    # Replace with your GHES domain
    - api.enterprise.githubcopilot.com
jobs:
  agent:
    env:
      GH_HOST: github.example.com           # Replace with your GHES domain
---

# Your workflow prompt here
```

### Verification Checklist

Before deploying a GHES workflow, verify:

- [ ] Enterprise Copilot licensing is enabled (site admin)
- [ ] PAT owner has Copilot seat assigned (org admin)
- [ ] PAT has `copilot_requests:read` permission
- [ ] `COPILOT_GITHUB_TOKEN` secret is configured in repository
- [ ] `engine.api-target` points to `api.enterprise.githubcopilot.com`
- [ ] GHES domain is in `network.allowed` list
- [ ] Copilot API domain is in `network.allowed` list
- [ ] `GH_HOST` is set in workflow configuration (if using `gh` commands)
- [ ] Workflow compiles without errors
- [ ] Test run completes successfully

## Related Documentation

- [GHES Prerequisites Guide](/gh-aw/guides/ghes-prerequisites/) - Complete setup requirements
- [Custom API Endpoint Configuration](https://github.com/github/gh-aw/blob/main/docs/enterprise-configuration.md) - API target details
- [Network Configuration Guide](/gh-aw/guides/network-configuration/) - Network access setup
- [Common Issues](/gh-aw/troubleshooting/common-issues/) - General troubleshooting

## Getting Help

If issues persist after trying these solutions:

1. Review [existing GHES-related issues](https://github.com/github/gh-aw/issues?q=is%3Aissue+label%3AGHES)
2. Check workflow logs with `gh aw logs --run-id <run-id>`
3. Use workflow audit: `GH_HOST=<ghes-host> gh aw audit <run-id>`
4. Create a new issue with:
   - GHES version
   - Workflow frontmatter (sanitized)
   - Error messages from logs
   - Steps already attempted
