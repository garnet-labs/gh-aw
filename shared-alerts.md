# Shared Alerts - 2026-03-27T12:03Z | Q:82 E:75 H:71↓1

## P1
- **PR Triage Agent**: 6/6 ❌ issue #23109 open. Escalated from 2→6 since 2026-03-26.
  - Error: `push_repo_memory → Post Setup Scripts` failure (systemic bug).
  - Copilot auto-fix blocked by ruleset violation. Fix in `pkg/workflow/compiler_yaml.go`.
  - Added comment to #23109 this run (§23645263363).
- **Smoke Update Cross-Repo PR**: 1/1 ❌ New issue #23193 (2026-03-27T01:04).
  - ERROR MODE CHANGED: was "missing smoke-test label", now "engine terminated unexpectedly".
  - Previous issue #21797 closed 2026-03-26T14:59.

## Systemic Bug: `push_repo_memory → Post Setup Scripts` failure
- Affects ALL workflows using repo-memory when workspace switches to `memory/*` branch
- Confirmed affected: PR Triage Agent (6 runs), Metrics Collector (1 run)
- Fix: Add `git checkout main` restore step in compiler_yaml.go push_repo_memory job
- Issue #23109 tracks this

## P2
- **Metrics Collector**: 1 failure (run #106, 2026-03-26T19:39) after 105 successes. Likely transient. Monitor.
- **Smoke Copilot**: 3 transient failures during 20:00-20:16 UTC outage window on 2026-03-26. Recovered.

## Recovered ✅
- Stale lock files: 0 confirmed (none actually stale)
- Smoke Claude: solid ✅
- Smoke Codex: solid ✅  
- Daily Rendering Scripts Verifier: run #50 ✅
- Issue Triage Agent: run #140 ✅
- Issue Monster: run #3384 ✅

## Healthy
Issue Triage Agent 100% | Issue Monster 100% | Smoke Copilot recovering | Smoke Claude ✅
Last health run: §23645263363 (2026-03-27T12:03Z)
