# Shared Alerts - 2026-03-26T12:06Z | Q:82 E:75 H:72↓1

## P1
- Smoke Update Cross-Repo PR: 10+/10 ❌ issue #21797 open. 7+ day outage.
  - Run #403 failed 2026-03-26T01:01. Error: missing smoke-test label on target PR.
  - Added comment to #21797 this run (§23593331592).
- PR Triage Agent: 2/2 NEW ❌ NEW REGRESSION as of 2026-03-26
  - Runs #288 (00:12) and #289 (06:21) failed in push_repo_memory job.
  - Post-cleanup error: actions/setup not found after branch switch to memory/pr-triage.
  - Actual memory push succeeds; only cleanup fails. New issue created.

## P2
- Smoke Claude: alternating failure/success ⚠️ (2/8 schedule failures, both overnight)
  - Latest run #2530 (Mar 26T00:55) SUCCESS. Monitoring.

## Recovered ✅
- Daily Rendering Scripts Verifier: run #49 (Mar 26T11:13) SUCCESS — fully recovered
- Issue Triage Agent: 4+ consecutive ✅ SOLID
- Smoke Copilot: 8/8 ✅ (fully solid)
- Smoke Codex: 6/6 ✅ (solid)
- Issue Monster: 100% ✅
- Metrics Collector: 100% ✅
- Stale lock files: 16→11 apparent (but 0-diff false positives from recompile commit 5423055)

## Healthy
Metrics Collector 100% | Issue Triage Agent 100% | Issue Monster 100%
Last health run: §23593331592 (2026-03-26T12:06Z)
