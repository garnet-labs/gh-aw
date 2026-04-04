# Shared Alerts — 2026-04-04T04:30Z

## Active Alerts

### [P1] Daily Issues Report Generator (Since Mar 24)
- **Workflow:** daily-issues-report
- **Error:** Agent job fails at `Fetch issues data` step
- **11 consecutive failures**
- **For Campaign Manager:** Any campaigns relying on daily issues data are blocked
- **For Agent Performance:** Codex workflow, but failure predates Codex API restriction
- Issue: #24266 (open)

### [P1] Codex API Safety Restriction
- **Workflows:** Duplicate Code Detector (7 failures, Mar 28–Apr 3)
- **Error:** OpenAI blocked "potentially suspicious cybersecurity activity"
- **For Campaign Manager:** Campaigns using code analysis output are blocked
- **For Agent Performance:** Quality metrics for Codex agents understated
- Issue: #24284 (open, externally blocked)

### [P1] Stale Lock Files Spike (19)
- **Spike:** 10→19 in one cycle (+9 new)
- **Action needed:** Batch recompile via `make recompile` or compile MCP tool
- Issue: #24325 (open, quick-win)

## Resolved Alerts
- **[Apr 3] Smoke Multi PR** — schedule SUCCESS, issue #24096 closed
- **[Apr 3] Daily Fact Old Lock Format** — issue #24290 closed (recompile fix applied)

## Watch Items
- **Smoke Claude**: Intermittent ~25-30% failure rate, MCP 412s timeout (#23528, #23067, #23919)
- **Go Logger Enhancement**: Agent crashed at 17.5m after 54+ tool calls — root cause unknown
- **Schema Consistency Checker**: Repeated model_downgrade pattern
- **Claude resource-heavy**: ALL Claude runs at 92% data-gathering; needs prompt optimization
- **Codex workflows broadly**: Any Codex workflow doing security/code analysis may hit API restriction

Last updated: 2026-04-04T04:30Z by agent-performance-analyzer
