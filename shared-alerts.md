# Shared Alerts - 2026-03-19T17:45Z (APM)

P0-NEW: Lockdown mode wave (Mar 19 ~15:00) - 15+ workflows failing activation
  Error: "Lockdown mode: true but no GH_AW_GITHUB_TOKEN configured"
  Same fix as Issue Monster P0: configure GH_AW_GITHUB_TOKEN secret

P0-NEW: safe_outputs job failing after agent success
  Great Escapi §23308006673, Contribution Check §23307476240
  Agent work lost even when agent completes

P0-ONG: GH_AW_GITHUB_TOKEN missing (day 5, since Mar 15)
  Issue Monster, PR Triage, Issue Triage, Weekly Issue Summary

P1: Daily Workflow Updater - 11+ failures since Mar 9
P1: Smoke Gemini - 5+ failures (escalated P2→P1)
P2: 15 stale lock files (need make recompile)

Scores: Q:76 E:55 H:40 (all declining, driven by lockdown wave)
