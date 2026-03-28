# Workflow Health - 2026-03-28T12:00Z

Score: 70/100 (↓1 from 71). 178 workflows, 0 stale lock files.

## P1 Issues
- **PR Triage Agent**: 10 consecutive failures (runs #288-#297, since 2026-03-26T00:12). Issue #23151 open. Pattern: `push_repo_memory → Post Setup Scripts` failure (systemic bug). Added escalation comment this run.
- **Smoke Update Cross-Repo PR**: Schedule run #428 (2026-03-28T00:58) FAILED. PR_request runs (#429, #430) SUCCEED. Error: `agent` job terminates unexpectedly + `detection` job fails (no THREAT_DETECTION_RESULT). Issue #23193 open. Added status comment this run. Root cause differs from PR Triage (not push_repo_memory).

## P2 Warnings
- **Metrics Collector**: 2 consecutive failures (runs #106-#107). NEW issue created (#aw_mc001). Root cause: agent writes `agent-performance-latest.md` to artifact root instead of `metrics/latest.json`. Glob filter `metrics/**` skips it → 0 metrics saved. Secondary: same post-setup cleanup bug. Metrics now stale since 2026-03-25.
- **Workflow Health Manager (self)**: Runs #282, #283 failed (same push_repo_memory systemic bug). Current run #284 in_progress.

## Systemic Bug: `push_repo_memory → Post Setup Scripts` failure
- Affects ALL workflows using repo-memory when workspace switches to `memory/*` branch during push
- Fix: Add `git checkout main` restore step in `compiler_yaml.go` push_repo_memory job
- Confirmed affected: PR Triage Agent (10 runs), WHM (2 runs), Smoke Update Cross-Repo PR (different manifestation)
- Issue #23151 tracks this

## Resolved ✅
- **Smoke Copilot**: Fully recovered. Runs #2663, #2664, #2665 all SUCCESS.
- **Smoke Update Cross-Repo PR** (PR triggers): Succeeding ✅
- **Stale lock files**: 0 confirmed.

## Actions Taken
- Added escalation comment to #23151 (PR Triage Agent, now 10 consecutive failures)
- Added status comment to #23193 (Smoke Update Cross-Repo PR, schedule still failing)
- Created new issue #aw_mc001 (Metrics Collector 2 consecutive failures, metrics infrastructure degraded)

## Score Breakdown
- PR Triage Agent: P1 continued (10 runs) → unchanged
- Metrics Collector: 2nd consecutive failure (worse) → -1
- WHM self: continued systemic → unchanged
- Smoke Copilot: recovered, stable → unchanged
- Net: 71 → 70 (↓1)

## Run Info
- Timestamp: 2026-03-28T12:00:00Z
- Run: §23684685577
- Score change: 71→70 (↓1)
