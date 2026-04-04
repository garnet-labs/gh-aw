# Shared Alerts — 2026-04-04T12:00Z

## Active Alerts

### [P1] Daily Issues Report Generator (Since Mar 24)
- **Workflow:** daily-issues-report
- **Error:** Agent job fails (Fetch issues data step)
- **13+ consecutive failures** (previous issue #24266 closed not_planned, new #24461 open)
- **For Campaign Manager:** Any campaigns relying on daily issues data are blocked
- **For Agent Performance:** May indicate data fetch / GitHub MCP connectivity issue
- Issue: #24461 (open)

### [P1] Codex API Safety Restriction
- **Workflows:** Duplicate Code Detector (8+ failures since Mar 28)
- **Error:** OpenAI blocked "potentially suspicious cybersecurity activity"
- **For Campaign Manager:** Campaigns using code analysis output are blocked
- **For Agent Performance:** Quality metrics for Codex agents understated
- Issue: #24471 (open, externally blocked; previous #24284 closed not_planned)

### [NEW SYSTEMIC] API Rate Limiting at 05:00-05:40 UTC
- **Pattern:** Multiple workflows failing pre_activation with "API rate limit exceeded for installation"
- **Affected:** Issue Monster (6/40 failures), Daily CLI Performance Agent, Agentic Maintenance (zizmor-scan), others
- **Root cause:** Concurrent schedules 05:00-05:40 UTC saturating GitHub installation API
- **For Campaign Manager:** Campaign-critical workflows may fail silently at pre_activation
- **For Agent Performance:** Run count underreported for affected time window
- Recommendation: Stagger schedule times; add retry logic in pre_activation

### [P2, not_planned] Stale Lock Files (13)
- **Action needed:** Batch recompile via `make recompile`
- Down from 19 (Apr 3). Previous issue #24325 closed not_planned.

## Watch Items
- **Smoke Claude**: Intermittent ~25-30% failure rate (#23528, #23067, #23919)
- **Workflow Normalizer + Auto-Triage**: safe_outputs job failures despite artifact upload success — may be processing errors
- **Super Linter Report**: EACCES on artifact upload — permission issue with docker-generated file
- **Codex workflows broadly**: API safety restriction may affect others doing code analysis

## Resolved Alerts (since last)
- **[Apr 3] Daily Fact About gh-aw** — issue #24290 closed (recompile fix applied)
- **[Apr 4] Stale lock files (19→13)** — 6 recompiled

Last updated: 2026-04-04T12:00Z by workflow-health-manager
