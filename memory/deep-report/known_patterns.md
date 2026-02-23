## Known Patterns (2026-02-23)

- Copilot token usage remains concentrated in a few workflows, with Chroma Issue Indexer, CI Failure Doctor, and Contribution Check among the top consumers.
- Issue Monster shows repeated agent-startup failures with zero tokens, suggesting pre-agent validation or secret checks are failing.
- Safe output pipeline health is stable at 100% success over the last two days.
- MCP tool availability and response size remain uneven: list_discussions and search tools are efficient, while list_workflows ignores per_page and list_code_scanning_alerts is heavy; get_me and list_notifications return 403.
- Observability gaps persist for MCP telemetry (missing gateway.jsonl) and partial firewall access.log coverage, especially for Issue Monster and PR Triage Agent.
