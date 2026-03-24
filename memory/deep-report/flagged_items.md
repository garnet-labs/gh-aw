## Flagged Items (2026-03-24)
- Duplicate contribution-check issue pattern: same-day report appears as both open and closed (`#22694`, `#22628`), indicating dedupe/close race or missing idempotency.
- Smoke-test operational noise: 4 smoke-test issues remain open, suggesting cleanup automation should be tightened for successful reruns.
- Stale open issue bucket remains meaningful (22 items), increasing risk of neglected regressions despite high throughput.
- Unlabeled open issue count is low but non-zero (5); sustained auto-triage is needed to prevent drift.
- Integrity filtering is still impacting `AI Moderator` workflows (`missing_data` on issue `#22703`), so guardrails for degraded-mode handling should be strengthened.
