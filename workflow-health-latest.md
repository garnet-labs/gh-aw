# Workflow Health - 2026-03-25T12:03Z

Score: 73/100 (↑1 from 72). 178 workflows, 16 stale lock files (↓4 from 20).

## P1 Issues
- **Smoke Update Cross-Repo PR**: 0/2+ schedule failures (100% failure rate, 6+ days). Run #375 (2026-03-25T00:58) FAILED. Issue #21797 open (auto-generated, expires Mar 26). Closed #22523. Added comment to #21797 (this run). Error: missing `smoke-test` label OR git exit 128 on branch fetch.

## P2 Warnings
- **Daily Rendering Scripts Verifier**: Run #48 failed (2026-03-25T11:10). But failure is in threat detection job ("No THREAT_DETECTION_RESULT found"), NOT workflow logic. Brief recovery Mar 22-24 (#45-47 success). Issue #22168 previously closed. New failure appears to be threat detection infrastructure intermittency.
- **Smoke Claude**: 2/8 schedule failures (runs #2442 Mar 24T00:47, #2418 Mar 23T00:56). Both overnight runs. Latest #2501 (Mar 25T00:51) SUCCESS. Alternating pattern continues, likely timing-related.

## Recoveries / Healthy ✅
- **Smoke Copilot**: 8/8 consecutive ✅ (solid)
- **Smoke Codex**: 6/6 consecutive ✅ (solid)
- **Metrics Collector**: 8/8 ✅ 
- **PR Triage Agent**: 8/8 ✅ (fully solid)
- **Issue Triage Agent**: 3/3 ✅ RECOVERED
- **Issue Monster**: 1 transient failure (#3315 Mar 25) surrounded by 8+ successes

## Stale Lock Files (16)
blog-auditor, cloclo, contribution-check, craft, daily-copilot-token-report, daily-file-diet, daily-observability-report, deep-report, dev, draft-pr-cleanup, github-remote-mcp-auth-test, refiner, scout, smoke-agent-all-none, unbloat-docs, weekly-issue-summary

## Actions Taken
- Added comment to issue #21797 (Smoke Update Cross-Repo PR) with run #375 update and analysis
- Updated shared-alerts.md
- Updated memory

## Run Info
- Timestamp: 2026-03-25T12:03:00Z
- Run: §23539975667
- Score change: 72→73 (↑1)
