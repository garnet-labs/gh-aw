# Workflow Health - 2026-04-05T12:00Z

Score: 68/100 (↓2 from 70). 181 workflows total. Run: §24001031380

## 🆕 New Regression: Issue Monster
**CRITICAL** - 5 consecutive pre_activation failures since ~09:48 UTC today.
Error: `ERR_API: Failed to fetch check runs for ref "main": route.endpoint is not a function`
Runs #3715-#3719 failing. Runs #3712-#3714 succeeded earlier today. No prior issue.
Auto-issue created: #aw_imon0405 (WHM-created).
Lock file also stale.

## P1 Issues (Active)
- **Daily Issues Report Generator** (14+ days since Mar 24): Auto-issue #24703 (today). Ongoing.
- **Duplicate Code Detector** (Codex API restriction, 9+ days): Auto-issue #24718 (today). Externally blocked.
- **Issue Monster** (new today): WHM-created issue (see above). 5+ consecutive failures.

## Stale Lock Files (17) — ↑4 from 13 (11 fixed, 15 new)
NEW: archie, cli-consistency-checker, codex-github-remote-mcp-test, copilot-cli-deep-research, daily-code-metrics, daily-multi-device-docs-tester, daily-team-evolution-insights, deep-report, glossary-maintainer, grumpy-reviewer, issue-monster, org-health-report, poem-bot, smoke-service-ports, update-astro
CARRIED OVER: prompt-clustering-analysis, release
Action: run `make recompile`

## P2 (Intermittent, monitor)
- Contribution Check: 50% error rate on Apr 3 (3/6 runs). safe_outputs fails despite artifact OK. Run: §23998304116
- API rate limiting 05:00-05:40 UTC: multiple workflows hit installation rate limit

## P2 (Team decided "not_planned")
- Smoke Update Cross-Repo PR, Smoke Create Cross-Repo PR, Smoke Codex, Smoke Gemini

## Actions Taken This Run
- Created WHM Dashboard (2026-04-05): #aw_whm0405
- Created Issue Monster regression issue: #aw_imon0405
- Confirmed Daily Issues Report auto-issue #24703
- Confirmed Duplicate Code Detector auto-issue #24718
- Found 15 new stale lock files (significant churn from .md edits)

## Systemic Issues
1. **Issue Monster route.endpoint error** (NEW): pre_activation API call broken. Affects check run validation. May affect other workflows using same CI check logic.
2. **API rate limiting 05:00-05:40 UTC**: Concurrent scheduling hits installation rate limit.
3. **Codex API restrictions**: Duplicate Code Detector blocked.
4. **Stale lock files (17)**: Up from 13. Need `make recompile`.
5. **safe_outputs processing errors (intermittent)**: Contribution Check affected.

## Run Info
- Timestamp: 2026-04-05T12:00Z
- Run: §24001031380
- Score: 70→68 (↓2)
