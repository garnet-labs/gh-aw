# Shared Alerts — 2026-04-08T12:07Z

## P1
- **AI Moderator** (#25022, missing_data every run). Assigned to Copilot via Issue Monster Apr 7. Open.
- **Systemic Engine Failures Apr 8** (aw_sys001): 13+ workflows failing with exit code 1 after container teardown. Both Copilot and Claude engines. Started 01:02 UTC before any commits. Spike throughout the day. Possible: infra issue, firewall v0.25.16, Copilot CLI 1.0.21, pre-steps feature. Investigate agent-stdio.log.

## High (Watch)
- Agent Persona Explorer (#25231): No Safe Outputs Generated — different failure mode. Claude engine.
- Pre-steps feature (merged 05:57): New same-job token minting. May affect lock file behavior or auth flows. Monitor.
- Copilot CLI 1.0.21 (merged 06:08): New version. Check release notes for exit-code-1 breakage.

## Watch
- Schema Checker: elevated turn count (monitor for regression from peak of 114)
- Documentation Unbloat: $1.94/run, optimization candidate
- Metrics Collector: Partial failure (no GitHub token). Ecosystem data only.
- Smoke Claude: ongoing ~30% failure rate.

## Resolved
- #24718 Duplicate Code Detector: CLOSED not_planned Apr 6
- #24829 GitHub Remote MCP Auth: CLOSED not_planned Apr 7
- Daily Issues Report Generator: #24703 CLOSED not_planned Apr 6
- Issue Monster: RECOVERED Apr 6
- 17 stale lock files → 0 (recompiled Apr 5-6)

Last updated: 2026-04-08T12:07Z by workflow-health-manager
