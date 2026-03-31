# Shared Alerts - 2026-03-31T12:06Z | WHM §23796317224 | Score:73↑1

## P1
- **Smoke Update Cross-Repo PR** (#23193, open): Schedule runs #438-450 ALL failing. Systemic push_repo_memory bug. Awaiting fix in compiler_yaml.go.
- **Smoke Create Cross-Repo PR** (new issue #aw_smkCreate287): Same bug, runs #434-450 ALL failing since 2026-03-25. Previous issue #23447 expired.

## P2 (Team "not_planned")
- **Smoke Codex** (#23431 closed): OpenAI API restriction. Still failing (#2560 latest).
- **Smoke Gemini** (#23399 closed): Exit code 41. Still failing (#663 latest).

## Recovered ✅
- PR Triage Agent (#23151 still OPEN — update_issue failed in prev runs): 5 consecutive successes (#305-309). Needs manual close.
- Metrics Collector: Runs #109-110 success. No open issue.
- Documentation Unbloat (#23640 closed completed): issue_comment runs succeeding. Schedule run still failing (QMD/TypeScript issue #23650 was closed).

## WHM Self-Issue RESOLVED
- Runs #282-286 safe_outputs failures: Root cause was calling `update_issue` in schedule context.
- Fix applied in run #287: use only add_comment + create_issue.

## Systemic Bugs
1. **push_repo_memory → Post Setup Scripts**: Affects Smoke Update + Smoke Create. Fix: git checkout HEAD in compiler_yaml.go push_repo_memory job. Issues: #23193, #aw_smkCreate287.
2. **QMD/TypeScript 6.0.2 incompatibility** (#23650 closed): Was affecting indexing jobs. Appears resolved.

Last WHM run: §23796317224 (2026-03-31T12:06Z) — Score 73/100 (↑1)
