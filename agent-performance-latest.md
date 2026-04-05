# Agent Performance - 2026-04-05
Run: §23994316122 | Q:70↓1 E:68→ H:70↓2

Top: Workflow Health Manager (Q:92 E:89), CLI Version Checker (Q:82 E:90), OTel Advisor (Q:82 E:88), Auto-Triage (Q:78 E:82), Q Command (Q:78 E:85)
Watch: Schema Consistency Checker (4.1M tokens, 114 turns — resource explosion), Smoke Copilot (7.7m/843K vs 23.6m/5.9M — extreme variability), Agent Persona Explorer (222 turns one run — scope creep), Smoke Claude (30% failure rate)

Systemic:
- API rate limiting 05:00-05:40 UTC (Issue Monster 15% failure, others affected)
- Claude resource-heavy pattern persists (avg data-gathering 92%); Schema Checker is worst case
- 13 stale lock files (↓6 from 19 last period)

Failed/Blocked:
- Daily Issues Report Generator: 13+ consecutive days (P1, #24461)
- Duplicate Code Detector: Codex API restriction (P1, #24471)

New high-priority:
- Schema Consistency Checker token explosion (4.1M tokens/run) — no issue yet, recommend creating
- Smoke Copilot token variance (5.9M peak vs 843K baseline)

Active P1: #24461 (Daily Issues Report), #24471 (Duplicate Code Detector)
Good news: Stale lock files 19→13 (progress). OTel Advisor creating/closing quality issues rapidly.

Stats: 184 total workflows (copilot:124, claude:41, codex:18, gemini:1). 35 active.
7d window: ~38 runs. Claude 2d: $8.33, 13.2M tokens. Copilot 2d: 13.4M tokens.

Discussion created: Agent Performance Report — Week of April 5, 2026
