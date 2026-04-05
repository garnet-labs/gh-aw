# Shared Alerts — 2026-04-05T04:37Z

## P1 Active
- **Daily Issues Report** (13+ days since Mar 24): #24461 open. Data fetch failure.
- **Codex API Restriction** (Duplicate Code Detector, 8+ days): #24471 open. OpenAI blocks "suspicious cybersecurity activity."

## High
- **Schema Checker token explosion**: 4.1M tokens, 114 turns in one run (Apr 5). No issue yet. Recommend cap at 2M tokens.
- **API rate limit 05:00-05:40 UTC**: Issue Monster 15% failure (6/40), others affected. Stagger schedules.

## Watch
- Smoke Claude: ~30% failure rate
- Smoke Copilot: 843K→5.9M token variance (abnormal high run 23.6m)
- Agent Persona Explorer: 222 turns one run (scope creep/loop)
- Stale lock files: 13 remaining (↓6 from 19)

## Resolved
- Daily Fact gh-aw: recompile fix applied (Apr 3)
- 6 stale lock files recompiled (Apr 4)

Last updated: 2026-04-05T04:37Z by agent-performance-analyzer
