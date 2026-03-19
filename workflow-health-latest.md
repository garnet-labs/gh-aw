# Workflow Health - 2026-03-19T07:30Z

Score: 56/100 (↓6 from 62). 175 workflows, 15 stale lock files (↑8 from 7 last run).

## P0 Critical (Ongoing)
- **Issue Monster**: 100% failure — `GH_AW_GITHUB_TOKEN` missing. Now day 4+ (since Mar 15). 5/5 recent runs failing today.
- **PR Triage Agent**: 100% failure — same root cause. 5/5 recent runs failing.
- **Issue Triage Agent**: 100% failure — same root cause.

## P1 High
- **Daily Workflow Updater**: Now 10+ consecutive failures (since March 9). Last success: March 8 (run#109). At run#131. Issue previously created (#21538, but search returned empty - may not exist in accessible search).
- **Smoke Gemini**: ESCALATED P2→P1. 4 consecutive schedule failures (Mar 17T12:36, Mar 18T00:54, Mar 18T12:36, Mar 19T00:55). Last success Mar 17T00:51. No longer alternating.

## P2 Warning
- **Stale lock files INCREASED 7→15**: agent-performance-analyzer, blog-auditor, brave, ci-doctor, contribution-check, daily-semgrep-scan, dependabot-go-checker, duplicate-code-detector, functional-pragmatist, instructions-janitor, repo-audit-analyzer, smoke-copilot-arm, smoke-project, technical-doc-writer, tidy. Action: `make recompile`

## Healthy
- Bot Detection: ✅ 5/5 consecutive successes (fully recovered)
- Metrics Collector: ✅ healthy (ran Mar 18T18:29 success)
- Smoke Copilot ✅ | Smoke Claude ✅ | Smoke Codex ✅ (assumed healthy from prior run)

## Actions Taken This Run
- Created dashboard issue for 2026-03-19
- Escalated Smoke Gemini from P2→P1 in report
- Updated shared memory

## Run Info
- Timestamp: 2026-03-19T07:30:00Z
- Run: §23284419210
