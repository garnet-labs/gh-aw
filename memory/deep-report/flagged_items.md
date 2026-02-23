## Flagged Items for Monitoring (2026-02-23)

- MCP gateway.jsonl missing in all MCP-enabled runs, leaving a telemetry gap.
- Firewall access.log missing in multiple Issue Monster and PR Triage Agent runs.
- Issue Monster recurring agent-startup failures with zero tokens; likely lockdown token or secret validation problem.
- Seven validator files exceed 300 lines, with strict_mode_validation.go at 566 lines.
- Schema consistency findings: firewall support description incorrect, firewall log-level key mismatch, and cleanup_script missing from schema.
- Documentation Noob Tester upload_assets failure and high firewall block rates during browser runs.
- AI Moderator missing GitHub MCP tools, reducing moderation context.
