## DeepReport Memory (2026-04-02T15:45:00Z)

### Trends
- Tokens/30d: 90.4M, -46% vs prior; session completion 84% (4-day high).
- PR merge rate: 82.5% (30d), 1.4h avg; safe-output: 80.8% (burst day, baseline ~95%).
- Issues: 73 open (week view); 5 unlabeled; 3 open security findings.
- Codebase: 721,852 LOC, quality 73/100, test ratio 2.19x.

### Active Patterns
- **P0 rate limit burst**: ~30 workflows at `0 12 *` → 41s thundering herd at 12:13 UTC → 7 safe-output failures/day.
- DIFC loop: Auto-Triage on #23725,#23726; 439 events/7d; unfixable without `min-integrity` change.
- Smoke failures: 12 open `[aw]` issues (#23995 Claude, #23994 Copilot, #23989 Codex, #23980 Gemini).
- Security: #23740,#23079,#22914 (szabta89), unowned, 2+ cycles old.
- `brave.md`: gamified messages inconsistent with enterprise standard.
- HITL shift: sessions moving to `action_required` (80%) — deliberate design.

### Issues Filed This Run
- Rate limit burst fix (schedule staggering)
- Label 5 unlabeled issues (#24128,#23963,#23935,#23178,#23148)
- brave.md tone fix
