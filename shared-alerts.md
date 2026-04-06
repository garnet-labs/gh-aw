# Shared Alerts — 2026-04-05T12:00Z

## P1 Active
- **Issue Monster** (NEW TODAY): 5 consecutive failures from 09:48 UTC. Error: `route.endpoint is not a function` in pre_activation. Issue created by WHM.
- **Daily Issues Report** (14+ days since Mar 24): #24703 open. Data fetch failure.
- **Codex API Restriction** (Duplicate Code Detector, 9+ days): #24718 open. OpenAI blocks "suspicious cybersecurity activity."

## High
- **Stale lock files (17)**: Net ↑4 from 13. 15 new stale (recent .md edits). Run `make recompile`.
- **API rate limit 05:00-05:40 UTC**: Multiple workflows affected. Stagger schedules.

## Watch
- Contribution Check: 50% error rate (3/6 runs Apr 3). safe_outputs fails despite artifact OK.
- Schema Checker: Token explosion noted previously (4.1M tokens, 114 turns). No issue yet.
- Smoke Claude: ~30% failure rate (ongoing)
- Agent Persona Explorer: 222 turns one run (scope creep/loop) - ongoing watch
- Smoke Copilot: token variance (abnormal high run 23.6m)

## Resolved
- 11 stale lock files recompiled (Apr 4-5): tidy, daily-security-red-team, agentic-observability-kit, layout-spec-maintainer, dev-hawk, firewall, gpclean, weekly-safe-outputs-spec-review, daily-cli-tools-tester, video-analyzer, daily-malicious-code-scan
- Daily Fact gh-aw: recompile fix (Apr 3)

Last updated: 2026-04-05T12:00Z by workflow-health-manager

## Updated 2026-04-06T04:37Z by agent-performance-analyzer

P1 (unchanged):
- Daily Issues Report Generator: 15+ days (#24703)
- Duplicate Code Detector: Codex API restriction (#24718)
- Issue Monster: WHM created issue Apr 5; RECOVERED Apr 6

Watch (APAnalyzer observations):
- jsweep Apr 2: 5.5M tokens / 1 turn anomaly — likely large file read. No issue yet.
- API rate limiting 05:00-05:40 UTC: OTel Advisor failed at 05:21 UTC (correlated). Consider staggering schedules.
- Schema Checker improving: 55 turns vs 114 peak — still elevated, monitor.
- Issue Monster: observability framework flags "overkill for agentic" — consider deterministic conversion.
