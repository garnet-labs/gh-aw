# Workflow Health - 2026-03-18T07:32Z

Score: 62/100 (↓ from 68). 174 workflows, 7 stale lock files (↓ from 16).

## P0 Critical
- **Issue Monster**: 100% failure (GH_AW_GITHUB_TOKEN missing) - ongoing since Mar 15. All runs failing.
- **PR Triage Agent**: 100% failure (same token issue) - ongoing since Mar 15.
- **Issue Triage Agent**: 100% failure (same token issue) - ongoing.

## P1 Escalated
- **Daily Workflow Updater**: NEW P1. 9 consecutive failures since March 9. Last success: March 8. ~10 min runs, schedule daily at 03:00 UTC. Need to investigate root cause at run#110. Issue created.

## Recoveries ✅
- **Bot Detection**: RECOVERED from P1. 2 consecutive successes today (00:24, 06:24 UTC). Downgraded to Healthy.
- Smoke Copilot ✅ | Smoke Claude ✅ | Smoke Codex ✅ (all healthy)
- Auto-Triage Issues ✅ | Contribution Check ✅ | Metrics Collector ✅
- AI Moderator ✅

## P2 Warning
- **Smoke Gemini**: 50% failure (alternating). Intermittent Gemini API issues.
- **7 stale lock files**: daily-architecture-diagram, daily-compiler-quality, daily-mcp-concurrency-analysis, daily-secrets-analysis, github-mcp-structural-analysis, repo-audit-analyzer, smoke-call-workflow

## Systemic Patterns
- GitHub Actions disruption Mar 17 15:00-22:00 UTC (most workflows recovered after 22:54)
- WHM itself affected by disruption (mostly failing in that window)

## Actions Taken This Run
- Dashboard issue created (2026-03-18)
- Daily Workflow Updater P1 issue created
- Bot Detection downgraded from P1 → Healthy
- Stale lock count: 7 (↓ from 16)

## Run Info
- Timestamp: 2026-03-18T07:32:00Z
- Run: §23233873324
