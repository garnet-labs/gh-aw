---
title: GHES Prerequisites for Copilot Engine
description: Complete setup guide for using the Copilot engine with GitHub Enterprise Server
sidebar:
  order: 455
---

This guide details the prerequisites and configuration steps required to use agentic workflows with the Copilot engine on GitHub Enterprise Server (GHES).

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

If issues arise after setup, see the [GHES Troubleshooting Runbook](/gh-aw/troubleshooting/ghes-copilot/) for common problems and solutions.

Quick checks:
- **400 Bad Request**: Verify Copilot is licensed and API proxy routing is correct
- **403 Unauthorized**: Verify PAT owner has Copilot seat assigned
- **Firewall blocks**: Ensure GHES domain is in `network.allowed`
- **GH_HOST errors**: Ensure `GH_HOST` environment variable is set

## Related Documentation

- [GHES Troubleshooting Runbook](/gh-aw/troubleshooting/ghes-copilot/) - Diagnose and resolve GHES-specific issues
- [Custom API Endpoint Configuration](https://github.com/github/gh-aw/blob/main/docs/enterprise-configuration.md) - Detailed API target configuration
- [Network Configuration Guide](/gh-aw/guides/network-configuration/) - Network access setup
- [Tools Configuration](/gh-aw/reference/tools/) - MCP server and tool setup
