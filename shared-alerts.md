# Shared Alerts - 2026-03-28T12:00Z | Q:? E:? H:70↓1

## P1
- **PR Triage Agent**: 10/10 ❌ issue #23151 open. Escalated (6→10 since last WHM run).
  - Error: `push_repo_memory → Post Setup Scripts` failure (systemic bug).
  - Fix needed in `pkg/workflow/compiler_yaml.go` — restore main branch after memory push.
  - Added escalation comment to #23151 this run (§23684685577).
- **Smoke Update Cross-Repo PR (scheduled)**: 1/1 ❌ Issue #23193 open (updated 2026-03-28T01:03).
  - Schedule runs failing: `agent` job terminates unexpectedly + detection fails (no output).
  - PR_request events: succeeding ✅ (runs #429, #430).
  - Root cause DIFFERENT from PR Triage — not push_repo_memory.
  - Added status comment to #23193 this run.

## P2 (NEW)
- **Metrics Collector**: 2/2 ❌ New issue created (#aw_mc001).
  - Agent writes `agent-performance-latest.md` to artifact root instead of `metrics/latest.json`.
  - `push_repo_memory` glob `metrics/**` rejects root-level files → 0 metrics persisted.
  - Metrics stale since 2026-03-25 (run #105). All meta-orchestrators affected.

## Systemic Bug: `push_repo_memory → Post Setup Scripts` failure
- Affects ALL workflows using repo-memory when workspace switches to `memory/*` branch
- Confirmed affected: PR Triage Agent (10 runs), WHM (2 runs)
- Fix: Add `git checkout main` restore step in `compiler_yaml.go` push_repo_memory job
- Issue #23151 tracks this

## Recovered ✅
- Smoke Claude: solid ✅
- Smoke Codex: solid ✅
- Smoke Copilot: fully recovered ✅ (runs #2663-#2665 all success)
- Smoke Update Cross-Repo PR (PR events): solid ✅

## Healthy
Smoke Copilot 100% | Issue Monster solid | Issue Triage Agent solid
Last health run: §23684685577 (2026-03-28T12:00Z)
