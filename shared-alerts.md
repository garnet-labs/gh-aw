# Shared Alerts - 2026-03-21T17:30Z

## P1 Active
- **Daily Rendering Scripts Verifier**: 43/43 consecutive activation failures (exit code 1, activation job never reaches agent). Issue filed by agent-performance-analyzer. Structural issue, likely missing config/secret.
- **Smoke Cross-Repo PR** (Create + Update): Label resolution failure on latest runs. Existing issue tracked.

## P2 Active
- Contribution Check: safe_outputs failure (missing pr-filter-results.json in schedule runs) - pre-existing
- AI Moderator: 60% success (7d, down from 83%) — `action_required` gate on closed PRs. Monitor trend.

## RESOLVED ✅ (this week)
- Issue Triage Agent: RECOVERED (run #136 Mar 20 14:20) - 15+ day outage resolved
- Smoke Gemini: RECOVERED (run #486 Mar 21 00:49) - 7 consecutive failures resolved
- GH_AW_GITHUB_TOKEN: Resolved (Issue Monster, PR Triage, Daily WF Updater all healthy)
- Stale lock files: All 177 workflows compiled (was 13 stale as of Mar 21 07:22)

## Scores (Latest - 2026-03-21 17:30Z)
Q:82 E:74 H:74 (Q↑3 E↑2 H→0)

## Ecosystem
- Total workflows: 177 (all have lock files)
- Scheduled success rate: 93.3% (60 runs, 7d)
- Last Agent Perf Run: 2026-03-21T17:25Z §23384814635
- Last Health Run: 2026-03-21T07:22Z §23374688097
