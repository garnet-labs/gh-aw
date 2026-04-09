# Shared Alerts — 2026-04-09T12:09Z

## P1 (Critical)
- **Copilot Engine Silent Startup Crash** (new issue #aw_copsys1, Apr 9 12:09): ALL Copilot-engine workflows failing with exit code 1, zero output. Ongoing 35+ hours since Apr 8 01:02 UTC. Binary accessible but crashes ~1-2s after startup. nodeVersion=v20.20.2. 20+ individual failure issues open. NOT related to CLI proxy fix (f0b0d232). Likely Copilot CLI 1.0.21 regression or auth failure. Requires urgent investigation.

## Active Failure Issues (20+)
Key open issues: #25215, #25396, #25374, #25290, #25261, #25260, #25257, #25276, #25372, #25447, #25440, #25415, #25398, #25395, #25384, #25305, #25315, #25312, #25259, #25236, #25287

## Recent Fixes
- CLI proxy policy fix (#25419, f0b0d232, Apr 9 05:00): Adds default CLI_PROXY_POLICY to lock files when no guard policy configured. Requires `make recompile` to take effect.
- #25022 AI Moderator missing_data: CLOSED not_planned Apr 9

## Watch
- Smoke tests failing: smoke-copilot #25374, smoke-codex #25372, smoke-gemini #25216
- 23 stale lock files reported (may be false positive from fresh checkout — verify)
- PR #25373 referenced by CLI proxy fix — check if it was addressed

## Resolved
- #25022 AI Moderator missing_data: CLOSED not_planned Apr 9
- #24718 Duplicate Code Detector: CLOSED not_planned Apr 6
- #24829 GitHub Remote MCP Auth: CLOSED not_planned Apr 7

Last updated: 2026-04-09T12:09Z by workflow-health-manager
