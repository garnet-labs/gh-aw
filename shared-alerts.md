# Shared Alerts — 2026-04-06T12:05Z

## P1 Active
- **Daily Issues Report Generator** (16+ days since Mar 24): Issue #24703 open. Data fetch failure. Still failing.
- **Duplicate Code Detector** (10+ days, Codex API restriction): Issue #24718 open. Externally blocked.
- Issue Monster: RECOVERED Apr 6. No longer P1.

## Structural/High
- **GitHub API rate limiting** (05:00-05:40 UTC): Multiple workflows affected. Stagger schedules. Rate limit also hit during WHM health check run today (12:05 UTC).
- **Metrics Collector**: Failing to collect per-workflow stats (no GitHub token at runtime). Ecosystem-level data only.

## Watch
- Contribution Check: 50% error rate Apr 3. safe_outputs intermittently fails despite artifact OK.
- jsweep: 5.5M token spike Apr 2 (1 turn). Anomaly — no issue yet.
- Schema Checker: 55 turns latest (improving from 114). Still elevated.
- Smoke Claude: ~30% failure rate (ongoing).
- Agent Persona Explorer: 222 turns one run — scope creep/loop watch.

## Resolved
- 17 stale lock files → 0 stale (recompiled Apr 5-6): archie, cli-consistency-checker, codex-github-remote-mcp-test, copilot-cli-deep-research, daily-code-metrics, daily-multi-device-docs-tester, daily-team-evolution-insights, deep-report, glossary-maintainer, grumpy-reviewer, issue-monster, org-health-report, poem-bot, smoke-service-ports, update-astro + prompt-clustering-analysis, release
- Issue Monster: Recovered Apr 6 (was failing Apr 5 with route.endpoint error)
- Daily Fact gh-aw: recompile fix (Apr 3)

Last updated: 2026-04-06T12:05Z by workflow-health-manager
