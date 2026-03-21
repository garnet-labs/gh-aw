<!--

Hello fellow agent! Welcome to GitHub Agentic Workflows = Actions + Agent + Safety. 
Here are some pointers to get you started in using this tool.

- Create a new workflow: https://raw.githubusercontent.com/github/gh-aw/main/create.md
- Install: https://raw.githubusercontent.com/github/gh-aw/main/install.md
- Reference: https://raw.githubusercontent.com/github/gh-aw/main/.github/aw/github-agentic-workflows.md

-->

# GitHub Agentic Workflows

Write agentic workflows in natural language markdown, and run them in GitHub Actions.

## Contents

- [Quick Start](#quick-start)
- [Overview](#overview)
- [Guardrails](#guardrails)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Share Feedback](#share-feedback)
- [Peli's Agent Factory](#pelis-agent-factory)
- [Related Projects](#related-projects)

## Quick Start

Ready to get your first agentic workflow running? Follow our step-by-step [Quick Start Guide](https://github.github.com/gh-aw/setup/quick-start/) to install the extension, add a sample workflow, and see it in action.

## Overview

Learn about the concepts behind agentic workflows, explore available workflow types, and understand how AI can automate your repository tasks. See [How It Works](https://github.github.com/gh-aw/introduction/how-they-work/).

## Guardrails

Guardrails, safety and security are foundational to GitHub Agentic Workflows. Workflows run with read-only permissions by default, with write operations only allowed through sanitized `safe-outputs`. The system implements multiple layers of protection including sandboxed execution, input sanitization, network isolation, supply chain security (SHA-pinned dependencies), tool allow-listing, and compile-time validation. Access can be gated to team members only, with human approval gates for critical operations, ensuring AI agents operate safely within controlled boundaries. See the [Security Architecture](https://github.github.com/gh-aw/introduction/architecture/) for comprehensive details on threat modeling, implementation guidelines, and best practices.

Using agentic workflows in your repository requires careful attention to security considerations and careful human supervision, and even then things can still go wrong. Use it with caution, and at your own risk.

## Documentation

For complete documentation, examples, and guides, see the [Documentation](https://github.github.com/gh-aw/). If you are an agent, download the [llms.txt](https://github.github.com/gh-aw/llms.txt).

## Contributing

For development setup and contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## 🌍 Community Contributions

Thank you to the community members whose issue reports were resolved in this project!
This list is updated automatically and reflects all attributed contributions.

| Issue | Title | Author | Resolved By | Attribution |
|-------|-------|--------|-------------|-------------|
| [#21630](https://github.com/github/gh-aw/issues/21630) | Support sparse-checkout in compiled workflows for large monorepos | @Mossaka | [#21655](https://github.com/github/gh-aw/pull/21655) | direct |
| [#21243](https://github.com/github/gh-aw/issues/21243) | Support `github-app:` auth and Claude Code plugin registration for `dependencies:` (APM) | @holwerda | [#21286](https://github.com/github/gh-aw/pull/21286) | direct |
| [#20299](https://github.com/github/gh-aw/issues/20299) | Bug: `gh aw upgrade` generates lock files with previous version after upgrade | @grahame-white | [#20300](https://github.com/github/gh-aw/pull/20300) | direct |
| [#20249](https://github.com/github/gh-aw/issues/20249) | Feature Request: Cross-repo `workflow_call` validation and docs | @mvdbos | [#20301](https://github.com/github/gh-aw/pull/20301) | direct |
| [#18480](https://github.com/github/gh-aw/issues/18480) | gh-aw not working in cloud enterprise environments | @JoshGreenslade | [#21993](https://github.com/github/gh-aw/pull/21993) | direct |

### ⚠️ Attribution Candidates Need Review

The following community issues were closed during this period but could not be automatically linked to a specific merged PR. Please verify whether they should be credited:

241 community-labeled issues were closed during the review window (2026-02-26 – 2026-03-21) without a confirmed PR linkage. Run the [community attribution workflow](https://github.com/github/gh-aw/actions/workflows/daily-community-attribution.yml) or review [community-labeled closed issues](https://github.com/github/gh-aw/issues?q=is%3Aissue+label%3Acommunity+is%3Aclosed) to identify and credit additional contributors.

## Share Feedback

We welcome your feedback on GitHub Agentic Workflows! 

- [Community Feedback Discussions](https://github.com/orgs/community/discussions/186451)
- [GitHub Next Discord](https://gh.io/next-discord)

## Peli's Agent Factory

See the [Peli's Agent Factory](https://github.github.com/gh-aw/blog/2026-01-12-welcome-to-pelis-agent-factory/) for a guided tour through many uses of agentic workflows.

## Related Projects

GitHub Agentic Workflows is supported by companion projects that provide additional security and integration capabilities:

- **[Agent Workflow Firewall (AWF)](https://github.com/github/gh-aw-firewall)** - Network egress control for AI agents, providing domain-based access controls and activity logging for secure workflow execution
- **[MCP Gateway](https://github.com/github/gh-aw-mcpg)** - Routes Model Context Protocol (MCP) server calls through a unified HTTP gateway for centralized access management
- **[gh-aw-actions](https://github.com/github/gh-aw-actions)** - Shared library of custom GitHub Actions used by compiled workflows, providing functionality such as MCP server file management
