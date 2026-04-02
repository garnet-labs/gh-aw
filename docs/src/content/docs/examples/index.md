---
title: Examples
description: Browse complete examples of agentic workflows organized by trigger type — from issue and PR events to scheduled reports, manual dispatch, and multi-repository coordination.
sidebar:
  order: 0
---

These examples show complete, working agentic workflows organized by how they are triggered. Each example includes the workflow source and a description of what it does.

## By Trigger Type

### [Issue & PR Events](/gh-aw/examples/issue-pr-events/)

Workflows that run when issues or pull requests are opened, labeled, or updated. Use these for automated triage, labeling, code review, and project coordination.

### [Scheduled](/gh-aw/examples/scheduled/)

Workflows that run on a cron schedule — daily, weekly, or at custom intervals. Use these for recurring reports, maintenance tasks, and health checks.

### [Comment-Triggered](/gh-aw/examples/comment-triggered/)

Workflows that run when a specific command is posted in an issue or PR comment. Use these for on-demand tasks like `/summarize`, `/triage`, or `/assign`.

### [Manual Dispatch](/gh-aw/examples/manual/)

Workflows triggered manually from the GitHub Actions tab or with `gh aw run`. Use these for one-off tasks, investigations, or debugging.

### [Project Tracking](/gh-aw/examples/project-tracking/)

Workflows that update GitHub Projects boards based on issue and PR activity. Use these to keep project status in sync automatically.

### [Multi-Repository](/gh-aw/examples/multi-repo/)

Workflows that coordinate changes across multiple repositories — feature synchronization, cross-repo issue tracking, and organization-wide updates.

## Related

- [Design Patterns](/gh-aw/patterns/daily-ops/) — Higher-level patterns for common workflow scenarios
- [Creating Workflows](/gh-aw/setup/creating-workflows/) — How to author your own workflows
- [Quick Start](/gh-aw/setup/quick-start/) — Add your first workflow in 10 minutes
