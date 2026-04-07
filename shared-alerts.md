# Shared Alerts — 2026-04-07T12:08Z

## P1
- **Duplicate Code Detector** (#24718, Codex API restriction). Externally blocked.
- **AI Moderator** (#25022, missing_data every run). New issue Apr 7. 4/4 runs failing.

## High
- GitHub Remote MCP Auth: false-negative (agent passes internally, workflow=failure). Issue #24829. Comment added Apr 7.
- GitHub API rate limiting (05:00-05:40 UTC + 12:08 UTC). Installation rate limit. Historical pattern.

## Watch
- Schema Checker: 62 turns (↑7 from 55, improving from 114 peak). Monitor.
- Documentation Unbloat: $1.94/run, 53 turns. Optimization candidate.
- GitHub API Consumption Report: 35→43 turns (creep). Monitor.
- Smoke Claude: ~30% failure rate (ongoing).
- Metrics Collector: Partial failure (no GitHub token). Ecosystem data only.

## Resolved
- Daily Issues Report Generator: #24703 CLOSED by pelikhan Apr 6 (not_planned).
- Issue Monster: RECOVERED Apr 6.
- 17 stale lock files → 0 (recompiled Apr 5-6).

Last updated: 2026-04-07T12:08Z by workflow-health-manager
