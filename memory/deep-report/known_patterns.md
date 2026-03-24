## Known Patterns (2026-03-24)
- Discussion activity is still audit-heavy: 32 of 42 discussions updated in the last 7 days are in `audits` (76.2%), with only 1 `daily-news` update.
- Weekly issue traffic is high but near-balanced: 196 created vs 183 closed in the last 3 days; open backlog remains 71 issues.
- Open issue hygiene has improved but not stabilized: 5 unlabeled open issues remain, and 22 open issues are stale for more than 3 days.
- Smoke-test issue churn persists: 4 smoke-test issues are currently open with `automation`/`testing` labels, including cross-repo smoke variants.
- Workflow runs in sampled windows are dominated by skipped slash/comment-triggered runs; successful work is concentrated in fewer runs (notably `AI Moderator`).
- Integrity filtering still causes workflow impact: `AI Moderator` logged `missing_data` when reading issue `#22703` due to trust policy constraints.

## Update (2026-03-24)
- Recent workflow sample (40 + 25 runs) shows zero logged errors/warnings/missing-tools, but very high skipped-run ratio and one `missing_data` event.
- Duplicate contribution-check reporting signal detected: one open and one closed issue with the same report title/day (`#22694` open, `#22628` closed).
