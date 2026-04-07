# Workflow Health - 2026-04-07T12:08Z

Score: 73/100 (↑2 from 71). 182 workflows. Run: §24080416548

## KEY FINDING: Lock File Status

182 workflows, 182 lock files — all present. 16 files showed timestamp drift (1ms checkout artifact, all same git commit). **0 genuinely stale lock files.**

## P1 Issues (Ongoing)

- **Duplicate Code Detector** (#24718, Codex API restriction): Still open, externally blocked.
- **AI Moderator** (#25022, missing_data every run): New issue created Apr 7. Consistent 4/4 failure.

## High (Watch)

- GitHub Remote MCP Auth false-negative (#24829): Workflow passes internally but fails at Actions level. Comment added Apr 7.
- **GitHub API rate limit**: Installation rate limit exceeded during this run (reset ~12:27 UTC). Prevented per-workflow run queries — health assessment relies on shared memory from prior runs.

## P2 (Watch)

- Smoke Claude: ~30% failure rate (ongoing).
- Schema Checker: 62 turns (↑7 from 55). Elevated but improving from 114 peak.
- Documentation Unbloat: $1.94/run, 53 turns. Optimization candidate.
- Metrics Collector: Partial failure (no GitHub token at runtime). Ecosystem data only.

## Actions This Run

- No new issues created (existing issues cover active P1s)
- All 182 lock files verified: 0 genuinely stale (checkout timestamp artifact confirmed)
- Score updated: 71→73

## Score Breakdown

- Compilation success (all 182 lock files present): +20
- Lock files up to date (0 stale): +15
- P1 issues (×2, Duplicate Code Detector + AI Moderator): -10
- High issues (GitHub Remote MCP Auth): -4
- Smoke Claude failures + Intermittent errors: -6
- API rate limiting (structural concern): -2
- Subtotal: ~73/100

## Trends

- Lock files: 0 stale (stable)
- P1 count: 2 (Duplicate Code Detector ongoing, AI Moderator new Apr 7)
- Score: 68→71→73 (improving)

## Next Run Priorities

1. Check if AI Moderator (#25022) is progressing/resolved
2. Check if GitHub Remote MCP Auth (#24829) is resolved
3. Monitor Schema Checker turns (target: <50)
4. Verify Smoke Claude failure rate trend
