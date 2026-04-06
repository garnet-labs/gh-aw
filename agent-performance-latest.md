# Agent Performance - 2026-04-06
Run: §24018835783 | Q:69↓1 E:68→ H:69↓1

Top: Workflow Health Manager (Q:92 E:89), CLI Version Checker (Q:82 E:90), Smoke Copilot (Q:80 E:85), OTel Advisor (Q:82 E:88)
Watch: jsweep (6.9M tokens 7d, one run 5.5M/1 turn — token spike), Schema Checker (1.7M/55 turns latest — improving from 4.1M peak), Issue Monster (agentic overkill flagged; Apr 5 regression recovered Apr 6)

Systemic:
- API rate limiting 05:00-05:40 UTC (OTel failure at 05:21 correlated)
- Stale lock files: 17 (↑4 from 13) — need `make recompile`
- jsweep Apr 2 token anomaly: 5.5M tokens, 1 turn (unexplained spike)
- Issue Monster: "overkill for agentic" flagged by observability framework

P1 (no change):
- Daily Issues Report Generator: 15+ days failing (#24703)
- Duplicate Code Detector: Codex API restriction (#24718)
- Issue Monster: WHM issue created Apr 5 (recovered Apr 6)

Good news: Schema Checker improving (55 turns vs 114 previous). Smoke Copilot token variance normalized. Issue Monster recovered.

Stats: 184 total workflows (copilot:124, claude:41, codex:18, gemini:1). ~35 active.
7d window: 10 workflows analyzed in detail.

Discussion created: Agent Performance Report — Week of April 6, 2026
