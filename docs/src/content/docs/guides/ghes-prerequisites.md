---
title: GHES Copilot Setup and Troubleshooting
description: Complete setup guide and troubleshooting for using the Copilot engine with GitHub Enterprise Server
sidebar:
  order: 455
---

This guide covers the prerequisites, configuration steps, and troubleshooting for using agentic workflows with the Copilot engine on GitHub Enterprise Server (GHES).

## Overview

Using the Copilot engine on GHES requires coordination between site administrators, enterprise/organization administrators, and individual users. This guide breaks down requirements by role to help streamline the setup process.

## Prerequisites by Role

### Site Administrator Requirements

Site administrators must configure the GHES instance to support Copilot services:

#### 1. GitHub Connect

GitHub Connect must be enabled to allow your GHES instance to communicate with github.com's Copilot cloud services.

**How to verify:**
1. Navigate to **Site admin** → **Settings** → **GitHub Connect**
2. Verify the connection status shows "Connected"

**How to configure:**
- See [GitHub's documentation on GitHub Connect](https://docs.github.com/en/enterprise-server/admin/configuration/configuring-github-connect)

#### 2. Copilot Licensing

Copilot must be purchased and enabled at the enterprise level.

**How to verify:**
1. Navigate to **Site admin** → **Enterprise overview**
2. Check that GitHub Copilot appears in the list of enabled features

**How to configure:**
- Contact GitHub sales to purchase Copilot licenses
- Enable Copilot in the enterprise settings after purchase

#### 3. Network Configuration

The GHES firewall must allow outbound connections to Copilot API endpoints.

**Required domains:**
- `api.githubcopilot.com` - Standard Copilot API endpoint
- `api.enterprise.githubcopilot.com` - Enterprise Copilot API endpoint

**Ports:**
- `443` (HTTPS)

**How to verify:**
```bash
# From the GHES instance or a test machine within the network:
curl -I https://api.enterprise.githubcopilot.com
curl -I https://api.githubcopilot.com
```

Both should return HTTP responses (not connection errors).

### Enterprise/Organization Administrator Requirements

After site admin configuration, enterprise or organization administrators must assign Copilot access to users:

#### 1. Copilot Seat Assignment

Users whose PATs will be used for agentic workflows must have Copilot seats assigned.

**How to verify:**
1. Navigate to **Organization settings** → **Copilot** → **Access**
2. Find the user account that will provide the `COPILOT_GITHUB_TOKEN`
3. Verify they have Copilot access enabled

**How to configure:**
1. In organization settings, go to **Copilot** → **Access**
2. Add users or teams who need Copilot access
3. Save changes

#### 2. Organization Copilot Policy

The organization's Copilot policy must allow Copilot usage.

**How to verify:**
1. Navigate to **Organization settings** → **Copilot** → **Policies**
2. Verify Copilot is enabled for the organization

**How to configure:**
1. In organization settings, enable Copilot
2. Configure policies as needed for your organization

### User/Workflow Author Requirements

Users creating agentic workflows must configure tokens and workflow frontmatter correctly:

#### 1. Personal Access Token (PAT)

Create a fine-grained PAT with the correct permissions.

**Token type options:**
- **Fine-grained PAT** (recommended): Requires `copilot_requests:read` account permission
- **Classic PAT**: Requires `copilot` scope

**How to create a fine-grained PAT:**
1. Go to **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. Click **Generate new token**
3. Set an expiration date
4. Under **Account permissions**, grant `copilot_requests:read`
5. Generate and copy the token

**How to configure in repository:**
1. Navigate to **Repository settings** → **Secrets and variables** → **Actions**
2. Create a new repository secret named `COPILOT_GITHUB_TOKEN`
3. Paste the PAT value

> [!IMPORTANT]
> The PAT must belong to a user with an assigned Copilot seat (see organization admin requirements above).

#### 2. Workflow Configuration

Configure the workflow frontmatter to target the GHES instance and Copilot API.

**Required fields:**

```yaml
---
engine:
  id: copilot
  api-target: api.enterprise.githubcopilot.com
network:
  allowed:
    - defaults
    - github.example.com                    # Your GHES domain
    - api.enterprise.githubcopilot.com      # Enterprise Copilot API
---
```

**Field explanations:**
- `engine.api-target`: Points to the enterprise Copilot API endpoint
- `network.allowed`: Includes your GHES domain and the Copilot API endpoint

#### 3. GH_HOST Configuration

For workflows that use `gh` CLI commands, set the `GH_HOST` environment variable to target the GHES instance.

**Option 1: Add to workflow frontmatter (recommended):**

```yaml
---
jobs:
  agent:
    env:
      GH_HOST: github.example.com    # Your GHES domain
---
```

**Option 2: Add to prompt (for specific commands):**

```markdown
Before running any `gh` commands, configure the GitHub host:

```bash
export GH_HOST=github.example.com
```
```

## Complete Example Workflow

Here's a complete example showing all GHES-specific configuration:

```yaml
---
description: GHES workflow example
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
Respond to issue comments and help users with their questions.
```

## Verification Steps

After completing the setup, verify the configuration works:

### 1. Compile the Workflow

```bash
gh aw compile your-workflow.md
```

**Expected output:**
- No compilation errors
- `.lock.yml` file generated successfully

**Verify the compiled workflow:**

```bash
grep -A 2 "copilot-api-target" .github/workflows/your-workflow.lock.yml
```

You should see the `--copilot-api-target` flag with your configured endpoint.

### 2. Test Run

Trigger the workflow manually or via its configured event (e.g., create a comment on an issue).

**Check the workflow run:**
1. Navigate to **Actions** → **All workflows** → Select your workflow run
2. Open the agent job
3. Verify the "Run Copilot Agent" step completes successfully
4. Check for any API connection errors

### 3. Verify API Target

In the workflow logs, confirm the correct API endpoint is being used:

```bash
gh aw logs --run-id <run-id>
```

Look for log lines showing connections to `api.enterprise.githubcopilot.com`.

## Troubleshooting

This section provides solutions for common issues when using the Copilot engine on GHES.

### Quick Reference

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| `Error loading models: 400 Bad Request` | Copilot not licensed or API routing issue | Verify enterprise Copilot settings |
| `403 "unauthorized: not licensed to use Copilot"` | No Copilot seat assigned | Assign Copilot seat to PAT owner |
| `403 "Resource not accessible by personal access token"` | Wrong token permissions | Use fine-grained PAT with `copilot_requests:read` |
| Firewall blocks `api.<ghes-host>:443` | GHES domain not in allowlist | Add to `network.allowed` |
| `Could not resolve to a Repository` | `GH_HOST` not configured | Set `GH_HOST` environment variable |
| Wizard PR creation fails | Wizard targets github.com | Use manual `gh pr create` instead |
| `gh aw audit` fails | `GH_HOST` not set for CLI | Run `GH_HOST=<ghes-host> gh aw audit <run-id>` |

### Licensing and Authentication Issues

#### Error Loading Models: 400 Bad Request

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

#### 403 Unauthorized: Not Licensed to Use Copilot

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

#### 403 Resource Not Accessible by Personal Access Token

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

### Network and Connectivity Issues

#### Firewall Blocks GHES Domain

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

#### API Endpoint Routing Issues

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

### GitHub CLI Issues

#### Could Not Resolve to a Repository

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

#### Wizard PR Creation Fails

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

#### gh aw audit Fails on GHES

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

### Getting Help

If issues persist after trying these solutions:

1. Review [existing GHES-related issues](https://github.com/github/gh-aw/issues?q=is%3Aissue+label%3AGHES)
2. Check workflow logs with `gh aw logs --run-id <run-id>`
3. Use workflow audit: `GH_HOST=<ghes-host> gh aw audit <run-id>`
4. Create a new issue with:
   - GHES version
   - Workflow frontmatter (sanitized)
   - Error messages from logs
   - Steps already attempted

## Related Documentation

- [Custom API Endpoint Configuration](https://github.com/github/gh-aw/blob/main/docs/enterprise-configuration.md) - Detailed API target configuration
- [Network Configuration Guide](/gh-aw/guides/network-configuration/) - Network access setup
- [Tools Configuration](/gh-aw/reference/tools/) - MCP server and tool setup
- [Common Issues](/gh-aw/troubleshooting/common-issues/) - General troubleshooting
