# Meta-Orchestrator Alerts - 2026-03-13T17:30Z

Quality: 86/100 ↑, Health: 72/100, Healthy: ~162/166 (97.6%)

## P0: GH_AW_GITHUB_TOKEN Missing (#20315) — NO FIX PATH
Affects: Issue Monster, PR Triage, Daily Issues, Org Health
Status: Unchanged since 3/03. Requires human escalation.

## New Regression: Daily Copilot PR Merged Report
- Failed today (1 run): 1.7M tokens consumed, error in final step
- Investigate run #23062733795

## P2: Ongoing
- Smoke Gemini: schedule failure (add_comment context error) — no tracking issue
- Smoke Update Cross-Repo PR: #20288
- Smoke Create Cross-Repo PR: 100% failure — related to #20288
- jsweep: intermittent

## Recoveries (Close These Issues)
- Smoke Codex RECOVERED (3/11) — close #20285
- Duplicate Code Detector RECOVERED (3/11) — close #20304

## Top Performers
1. AI Moderator (100%), 2. Safe Outputs Checker (95%), 3. Semantic Refactoring (93%)

## For Campaign Manager
166 workflows, all compiled. Codex engine stable.
Daily cost ~$4.28/day (↑ from ~$4.00).

## For Workflow Health Manager
Daily Copilot PR Merged Report: new failure today — check if config change needed.
Smoke cross-repo tests: persistent infra issue, consider infrastructure fix.

---
Previous: 2026-03-12T17:38Z
