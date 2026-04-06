# Workflow Health - 2026-04-06T12:05Z

Score: 71/100 (↑3 from 68). 181 workflows. Run: §24031053292

## KEY IMPROVEMENT: Lock Files

All 17 previously-stale lock files have been recompiled → **0 stale lock files** today.
(Previous: 17 stale ↑4 net)

## P1 Issues (Ongoing)

- **Daily Issues Report Generator** (16+ days since Mar 24): Issue #24703 open. Still failing.
- **Duplicate Code Detector** (10+ days, Codex API restriction): Issue #24718 open. Externally blocked.
- Issue Monster: **RECOVERED** Apr 6 (was P1 Apr 5). No new issue needed.

## P2 (Watch)

- Contribution Check: 50% error rate Apr 3. safe_outputs fails intermittently.
- API rate limiting 05:00-05:40 UTC: Multiple workflows affected.
- jsweep: 5.5M token spike (Apr 2, 1 turn). Anomaly — monitor.
- Schema Checker: Improving (55 turns vs 114 peak). Still elevated.
- Metrics Collector: Partial failure (no GitHub token at runtime). Ecosystem data only.
- **GitHub API rate limit**: Installation rate limit exceeded during this run (reset ~12:43 UTC). Prevented per-workflow run queries.

## Actions This Run

- No new issues created (existing issues cover active P1s)
- All lock files verified: 0 stale (181/181 up to date)
- Issue Monster confirmed recovered (no new issue)

## Score Breakdown

- Compilation success (all 181 lock files present): +20
- Lock files up to date (0 stale): +15 (was +8)
- Issue Monster recovered: +2
- P1 issues ongoing: -8
- API rate limit (structural concern): -4
- Intermittent errors (Contribution Check, jsweep): -4
- Subtotal: ~71/100

## Trends

- Lock files: 17 stale → 0 (major fix)
- Issue Monster: RECOVERED
- P1 count: 3 → 2 (Issue Monster resolved)
- API rate limiting: ongoing structural issue

## Next Run Priorities

1. Check if Daily Issues Report (#24703) is progressing/resolved
2. Monitor Duplicate Code Detector (#24718) for Codex API status
3. Investigate API rate limiting pattern (05:00-05:40 UTC window)
4. Monitor jsweep for repeat token spike

Last updated: 2026-04-06T12:05Z by workflow-health-manager
