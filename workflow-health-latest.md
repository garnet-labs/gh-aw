# Workflow Health - 2026-03-27T12:03Z

Score: 71/100 (↓1 from 72). 178 workflows, 0 stale lock files.

## P1 Issues
- **PR Triage Agent**: 6 consecutive failures (runs #288-#293, since 2026-03-26T00:12). Issue #23109 open. Pattern: `push_repo_memory → Post Setup Scripts` failure (systemic). Copilot auto-fix failed with ruleset violation. Added comment to #23109 (this run).
- **Smoke Update Cross-Repo PR**: Run #417 (2026-03-27T01:01) FAILED. ERROR MODE CHANGED from "missing smoke-test label" to "engine terminated unexpectedly". Auto-generated issue #23193 created. Original #21797 closed 2026-03-26T14:59. Needs investigation.

## P2 Warnings  
- **Metrics Collector**: Run #106 (2026-03-26T19:39) FAILED — first failure after 105 consecutive successes. Dual failure: agent inference error (Copilot API) + push_repo_memory Post Setup Scripts. Likely transient. Monitor next run.
- **Smoke Copilot**: 3 failures during ~20:00-20:16 UTC window on 2026-03-26 (runs #2646, #2647, #2648 failed). Recovered — runs #2651, #2652 are success. Coincides with mass-skipped runs across multiple workflows. Likely transient GitHub outage window.

## Systemic Issue Confirmed
- **`push_repo_memory → Post Setup Scripts` failure** affects ALL workflows using repo-memory when workspace branch switches to `memory/*` branch during push. Fix needed in `pkg/workflow/compiler_yaml.go`. Affects: PR Triage Agent (6 runs), Metrics Collector (1 run).

## Resolved ✅
- **Stale lock files**: 0 confirmed (false positives from last run fully confirmed clean).
- **Smoke Claude**: Solid — runs #2544, #2545 success.
- **Smoke Codex**: Run #2527 success — solid.
- **Smoke Copilot**: Recovered from transient outage window.
- **Daily Rendering Scripts Verifier**: Run #50 (2026-03-27T11:10) SUCCESS — solid.
- **Issue Triage Agent**: Run #140 success — solid.
- **Issue Monster**: Run #3384 success — solid.

## Actions Taken
- Added escalation comment to issue #23109 (PR Triage Agent, now 6 consecutive failures + systemic pattern confirmed)

## Score Breakdown
- PR Triage Agent: continued P1 → no change from yesterday (already factored)
- Smoke Update Cross-Repo PR: still failing → no change (already factored)  
- Metrics Collector: new failure (1 run) → -1
- Post Setup Scripts systemic: confirmed multi-workflow → factored into -1 already
- Recovered items (stale locks, Claude, Codex) → offsetting

## Run Info
- Timestamp: 2026-03-27T12:03:00Z
- Run: §23645263363
- Score change: 72→71 (↓1)
