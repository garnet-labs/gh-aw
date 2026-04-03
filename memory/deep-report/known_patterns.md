## DeepReport Memory (2026-04-03T15:00:00Z)

### Trends
- Tokens/day: 99.5M raw (+10.1% vs Apr 2); 123 runs; 78.4% PR merge rate (stable 4d).
- Safe-output: 100% (recovered from Apr 2 rate limit spike). WHM score: 72/100 (↓3).
- Stale lock files: 19 (↑9 surge). P1 failures: 3 open.

### Active Patterns
- **Daily Issues Report Generator**: Fetch issues data step failing — 11 consecutive days. Unfixed.
- **Duplicate Code Detector**: Codex API restriction (cybersecurity flag) — externally blocked.
- **Daily Fact**: Old lock format (`v0` missing) → #24290 filed.
- **MCP get_me**: 403 errors for 5 consecutive days.
- **DIFC**: 8 integrity-filtered unlabeled issues — manual only.
- **Validation debt**: 9/54 validators >300 lines; 24 missing test files.

### Issues Filed (2026-04-03)
- Fix Daily Issues Report Generator (11-day failure)
- Batch recompile 19 stale lock files
- Add labels: constraint-solving, problem-of-the-day
