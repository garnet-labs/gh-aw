## Known Patterns (2026-03-19)
- Discussion activity is still audit-heavy: 32 of 42 recent discussions are in `audits`, with one `daily-news` post and limited general discussion.
- Failure concentration remains narrow but persistent in `Issue Monster` (3 failures in recent sampled runs), with additional single-run failures in `Issue Triage Agent`, `Super Linter Report`, and `Breaking Change Checker`.
- Token consumption remains highly skewed to a few workflows: `Daily Security Red Team Agent` (1.10M in sampled runs), `Daily CLI Performance Agent` (0.80M), and `Constraint Solving — Problem of the Day` (0.32M).
- Open issue quality regressed slightly: open issues increased to 76 and unlabeled open issues increased from 3 to 9.
- Firewall denials continue, especially blocked requests to `ab.chatgpt.com:443`, indicating recurring prompt/tool paths still attempting disallowed egress.
