# Workflow Health - 2026-04-09T12:09Z

Score: 70/100 (→ same as 71 yesterday, systemic issue ongoing). 187 workflows. Run: §24189259135

## KEY FINDING: Copilot Engine Silent Startup Crash (P1 ONGOING)

Copilot CLI binary crashes on startup (exit code 1, 0B output) on ALL Copilot-engine workflows.
- Started: Apr 8 01:02 UTC
- Duration: 35+ hours, STILL ACTIVE Apr 9 12:08 UTC
- Binary accessible but exits silently after ~1-2s
- nodeVersion=v20.20.2
- NOT related to CLI proxy fix (f0b0d232 merged Apr 9 05:00)
- New tracking issue created: #aw_copsys1

## P1 Issues (Active)

- **Copilot Engine Crash** (new issue #aw_copsys1, P1): All Copilot workflows failing. 20+ individual failure issues open. Silent startup crash, no output.

## Open Failure Issues (20+)

Most active:
- #25215 Auto-Triage Issues (19 comments, most active)
- #25396 Test Quality Sentinel (6 comments, best docs of pattern)
- #25374 Smoke Copilot (2 runs failed)
- #25290 Delight (updated 12:09 today)
- #25261 Dev
- #25260 Architecture Diagram Generator
- #25257 CI Cleaner
- #25276 Daily Fact
- #25372 Smoke Codex
- #25447 Refactoring Cadence
- #25440 Functional Pragmatist
- #25415 Smoke Multi PR
- ... and 8+ more

## Resolved Since Apr 8

- #25022 AI Moderator missing_data: CLOSED not_planned Apr 9 05:21

## Score Breakdown

- Compilation: 187/187 lock files: +35
- Systemic Copilot crash ongoing (35h+): -15
- 20+ open failure issues: -8
- CLI proxy fix merged (pending validation): +0
- Net: 70/100

## Score Trend

68 → 71 → 73 → 71 → 70 (Apr 5–9)

## Recent Fixes

- CLI proxy policy fix (#25419, f0b0d232): Always emit CLI_PROXY_POLICY env var in compiled lock files. Does NOT fix the Copilot crash.

## Next Run Priorities

1. Check if Copilot engine crash is resolved (most critical)
2. Monitor open failure issues for resolution
3. Verify CLI proxy fix takes effect when workflows recompiled
4. Track stale lock files (23 reported but may be false positive from fresh checkout)
