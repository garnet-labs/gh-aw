## Known Patterns (2026-03-11)

- Audit/report automation remains very high-frequency with daily recurring discussions across `Daily News`, `Daily Code Metrics`, `Auto-Triage`, firewall, MCP analysis, and UX/report quality tracks.
- Issue operations are strongly automation-driven: `app/github-actions` authored 401 of 500 weekly issues.
- Label hygiene for open issues is strong overall (only 1 unlabeled open issue), consistent with recent auto-triage reports showing 0 unlabeled open issues in sampled runs.
- Safe-output and workflow-quality work is shifting from broad stability fixes toward targeted quality improvements (validation file split recommendations, CLI formatting consistency, docs usability fixes).
- Firewall risk is concentrated, not widespread: recent reports repeatedly point to `Chroma Issue Indexer` blocked traffic (`proxy.golang.org`, `pypi.org`) while other monitored workflows remain mostly clean.
