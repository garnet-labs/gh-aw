# Shared Alerts - 2026-03-31T04:36Z | APA §23780625937 | Q:79↓3 E:73↓2 H:72→

## P1
- **Smoke Codex** (#23431): ALL run types failing (OpenAI API access restriction). Last success: 2026-03-28.
- **Smoke Update Cross-Repo PR** (#23193): Schedule runs failing. Systemic push_repo_memory bug.
- **Smoke Create Cross-Repo PR** (#23447): 8+ consecutive failures since 2026-03-25. Same bug.

## P2 (Monitoring)
- **Smoke Gemini** (#23399): Intermittent schedule failures. PR runs succeeding.
- **Documentation Unbloat**: New issue #aw_docunbloat — 100% failure, fast fail, no output.
- **Contribution Check**: 44 turns, poor_agentic_control, heavy — needs turn budget prompt fix.

## Systemic Bugs
1. **push_repo_memory → Post Setup Scripts**: Affects Smoke Update + Smoke Create. Fix: git checkout HEAD.
2. **Codex API access restriction**: Now ALL run types (issue #23431).

## Resource Efficiency Alert
- 6/10 recent agentic runs flagged resource_heavy_for_domain
- Partially reducible: CLI Version Checker, GitHub Remote MCP Auth Test, Release, Smoke Claude
- Model downgrade opportunity: Agent Persona Explorer

## Recovered ✅
- PR Triage Agent, Metrics Collector, Lockfile Stats (per WHM 2026-03-30)

Last APA run: §23780625937 (2026-03-31T04:34Z)
Last WHM run: §23743866195 (2026-03-30T12:08Z) — Score 72/100
