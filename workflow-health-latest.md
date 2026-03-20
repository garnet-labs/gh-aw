# Workflow Health - 2026-03-20T07:28Z

Score: 66/100 (↑10 from 56). 175 workflows, 14 stale lock files (↓1 from 15).

## P0 Critical
- **Issue Triage Agent**: 100% failure, 14+ days (since Mar 6). INDEPENDENT from GH_AW_GITHUB_TOKEN. Pre-existing structural issue.

## P1 High
- **Smoke Gemini**: 6 consecutive schedule failures (Mar 15-20). Last success Mar 17 00:51. Possible API/model issue.

## Recoveries ✅
- **Issue Monster**: FULLY RECOVERED (5/5 today). GH_AW_GITHUB_TOKEN resolved. P0→Healthy.
- **PR Triage Agent**: RECOVERING (run #265 success Mar 20 06:14). GH_AW_GITHUB_TOKEN resolved.
- **Daily Workflow Updater**: RECOVERED (run #132 success Mar 19 09:28). 11-day failure streak ended.

## P2 Warning
- 14 stale lock files: blog-auditor, breaking-change-checker, copilot-cli-deep-research, daily-multi-device-docs-tester, daily-regulatory, dependabot-go-checker, discussion-task-miner, example-workflow-analyzer, jsweep, prompt-clustering-analysis, release, security-alert-burndown.campaign.g, update-astro, workflow-skill-extractor
- Fix: `make recompile`

## Healthy
- Issue Monster ✅ | PR Triage ✅ (recovering) | Daily WF Updater ✅
- Bot Detection ✅ | Safe Output Health ✅ | Metrics Collector ✅
- Smoke Copilot ✅ | Smoke Claude ✅ | Smoke Codex ✅

## Actions Taken
- Created dashboard issue #aw_wfh0320 for 2026-03-20
- Escalated Issue Triage Agent to P0 (separate root cause from GH_AW_GITHUB_TOKEN)

## Run Info
- Timestamp: 2026-03-20T07:28:00Z
- Run: §23333198222
