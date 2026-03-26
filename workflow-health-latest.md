# Workflow Health - 2026-03-26T12:06Z

Score: 72/100 (↓1 from 73). 178 workflows, 11 apparent stale lock files (effectively 0-diff — false positives from same-second recompile in commit 5423055).

## P1 Issues
- **Smoke Update Cross-Repo PR**: 10+/10 consecutive schedule failures (100% failure rate, 7+ days). Latest: Run #403 (2026-03-26T01:01) FAILED. Issue #21797 open. Error: missing `smoke-test` label on target PR. Added comment to #21797 (this run).
- **PR Triage Agent**: NEW REGRESSION. 2 consecutive failures (#288, #289) starting 2026-03-26T00:12. `push_repo_memory` job fails in post-cleanup: `Can't find 'action.yml', 'action.yaml' or 'Dockerfile' under .../actions/setup` after branch switch to `memory/pr-triage`. Actual memory push succeeds; cleanup fails. Created new issue #aw_prtriage.

## P2 Warnings
- **Smoke Claude**: 2/8 failures (runs #2442, #2418 — both overnight). Latest #2530 (Mar 26T00:55) SUCCESS. Alternating pattern continues. Status: monitoring.

## Recovered ✅
- **Daily Rendering Scripts Verifier**: Run #49 (Mar 26T11:13) SUCCESS — recovered from #48 failure (Mar 25T11:10). Back to solid.
- **Issue Triage Agent**: 4+ consecutive ✅ SOLID
- **Smoke Copilot**: 8/8 ✅ (solid)
- **Smoke Codex**: 6/6 ✅ (solid)
- **Metrics Collector**: 105/105 ✅
- **Issue Monster**: 8+ consecutive ✅

## Stale Lock Files (11 apparent)
workflow-generator, artifacts-summary, copilot-pr-prompt-analysis, daily-community-attribution, daily-regulatory, daily-safe-output-optimizer, daily-workflow-updater, functional-pragmatist, issue-arborist, semantic-function-refactor, smoke-project

Note: All show 0-diff — caused by commit 5423055 touching .md and .lock.yml at same second. NOT truly stale. The 16 previously-stale files were recompiled and are now up to date.

## Actions Taken
- Added comment to issue #21797 (Smoke Update Cross-Repo PR) with run #403 update
- Created new issue for PR Triage Agent push_repo_memory failure (P1)
- Updated shared memory

## Score Breakdown
Previous stale: 16 → 11 apparent (but 0-diff, not truly stale) → neutral
Smoke Update: still failing → -0 (already factored in)
PR Triage Agent: new P1 → -1

## Run Info
- Timestamp: 2026-03-26T12:06:00Z
- Run: §23593331592
- Score change: 73→72 (↓1)
