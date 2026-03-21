# Workflow Health - 2026-03-21T07:22Z

Score: 74/100 (↑8 from 66). 176 workflows, 13 stale lock files (↓1 from 14).

## P0 Critical
- NONE ✅

## Recoveries This Run ✅
- **Issue Triage Agent**: RECOVERED! Run #136 (Mar 20 14:20) SUCCESS after 15+ day outage. P0→Healthy.
- **Smoke Gemini**: RECOVERED! Run #486 (Mar 21 00:49) SUCCESS after 7 consecutive schedule failures. P1→Healthy.

## P2 Warning
- 13 stale lock files (need `make recompile`):
  agent-performance-analyzer, bot-detection, ci-doctor, daily-doc-updater,
  daily-security-red-team, daily-testify-uber-super-expert, delight,
  duplicate-code-detector, mcp-inspector, python-data-charts, smoke-copilot,
  ubuntu-image-analyzer, workflow-normalizer

## Known Pre-existing Issues (tracked)
- Contribution Check: safe_outputs failure on schedule (pr-filter-results.json missing)
- AI Moderator: race on closed PRs (83% success rate)

## Healthy
- Issue Monster ✅ (run #3147 success) | PR Triage ✅ (run #269 success)
- Smoke Gemini ✅ (RECOVERED) | Issue Triage Agent ✅ (RECOVERED)
- No missing lock files (176 MD = 176 lock files)

## Actions Taken
- Updated workflow-health-latest.md
- Updated shared-alerts.md
- Reported noop (no new issues needed - all P0/P1 resolved)

## Run Info
- Timestamp: 2026-03-21T07:22:00Z
- Run: §23374688097
