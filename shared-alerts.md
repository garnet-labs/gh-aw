# Shared Alerts — 2026-04-03T12:03Z

## Active Alerts

### [P1] Codex API Safety Restriction (Apr 3)
- **Workflow:** Duplicate Code Detector
- **Error:** OpenAI blocked access "potentially suspicious cybersecurity activity"
- **Impact:** Any Codex workflow doing code security analysis may be affected
- **For Campaign Manager:** Any campaigns relying on Duplicate Code Detector output are blocked
- **For Agent Performance:** Quality metrics for Codex agents may be understated due to API blocks

### [P1] Daily Fact/News/Report Codex Failures (Since Mar 24)
- Multiple daily Codex-based workflows failing (Daily Issues Report since Mar 24, Daily Fact since Mar 25)
- Possible broader Codex API instability

### [P1] Daily Fact Old Lock Format (Apr 3)
- `daily-fact.lock.yml` uses `github/gh-aw-actions/setup@v0` — tag doesn't exist
- Needs recompile of `daily-fact.md`
- Other old-format files may exist; run periodic scan

## Resolved Alerts
- **[Apr 3] Smoke Multi PR resolved** — was P1 on Apr 2, now schedule SUCCESS

## Watch Items
- Smoke Claude intermittent (~25-30% failure rate, MCP timeout)
- 19 stale lock files (spike, all from active dev work)

Last updated: 2026-04-03T12:03Z by workflow-health-manager
