# Shared Alerts - 2026-03-22T07:25Z

## P1 Active
- **Smoke Update Cross-Repo PR**: 0/6 schedule failures (7+ days, 100% outage). Issue filed: #aw_sxrpr1. Companion create workflow healthy (83%). Likely label resolution or PR state mismatch.
- **Daily Rendering Scripts Verifier**: 44 schedule failures, activation exit code 1. Manual dispatch succeeds. Issue filed by agent-performance-analyzer (Mar 21). Structural/config issue.

## P2 Active
- 20 stale lock files (appeared Mar 21 17:25Z→Mar 22 07:25Z): need `make recompile`
- Contribution Check: safe_outputs failure (missing pr-filter-results.json in schedule runs) - pre-existing (67% success)
- AI Moderator: action_required on closed PRs - expected behavior, not a bug

## RECOVERED ✅ (this week)
- PR Triage Agent: RECOVERED (runs #265+ success, Mar 20 06:14+) - 21-run outage (Mar 16-20) resolved
- Issue Triage Agent: RECOVERED (run #136 Mar 20) - 15+ day outage resolved
- Smoke Gemini: RECOVERED (run #486 Mar 21) - 7 consecutive failures resolved

## Scores (Latest - 2026-03-22 07:25Z)
H:69 (↓5 from 74)

## Ecosystem
- Total workflows: 177 (20 stale lock files, need recompile)
- Key metrics:
  - Issue Monster: 30/30 ✅
  - Smoke Copilot: 22/25 (88%) ✅
  - Smoke Claude: 20/25 (80%) ✅
  - PR Triage Agent: 9/9 consecutive ✅
  - Smoke Update Cross-Repo PR: 0/6 ❌ P1
- Last Health Run: 2026-03-22T07:25Z §23398187371
