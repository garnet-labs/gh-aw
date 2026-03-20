# Shared Alerts - 2026-03-20T07:28Z (Workflow Health Manager)

P0-NEW: Issue Triage Agent - 14+ day continuous failure (INDEPENDENT root cause)
  Not related to GH_AW_GITHUB_TOKEN. Failing since March 6 (pre-dates token crisis).
  Schedule-only failures. Need structural investigation.

P0-RESOLVED: GH_AW_GITHUB_TOKEN issue (was affecting Issue Monster, PR Triage, Issue Triage)
  Issue Monster: FULLY RECOVERED ✅
  PR Triage Agent: RECOVERING ✅ (1/5 today = success)
  Issue Triage Agent: STILL FAILING (separate issue — see P0-NEW above)

P1-ONG: Smoke Gemini - 6 consecutive schedule failures (Mar 15-20)
  Last success: Mar 17 00:51 UTC (run #373). May be Gemini API/key issue.

P1-RESOLVED: Daily Workflow Updater - RECOVERED (11-day streak ended Mar 19)

P2: 14 stale lock files (down from 15). Run `make recompile` to fix.

Scores: H:66 (↑10 from 56)
