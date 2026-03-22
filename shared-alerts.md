# Shared Alerts - 2026-03-22T17:30Z

## P1 Active
- **Smoke Update Cross-Repo PR**: 0/6 schedule failures (7+ days, 100% outage). Issue filed: #aw_sxrpr1. Companion create workflow healthy (83%). Label resolution or PR state mismatch.
- **Daily Rendering Scripts Verifier**: RECOVERING 🎉 - Mar 22 schedule SUCCESS after 43+ consecutive failures. Mar 21 manual dispatch SUCCESS. Monitor 3-5 more days before closing P1 issue.

## P2 Active
- 20 stale lock files (appeared Mar 21 17:25Z→Mar 22 07:25Z): need `make recompile`
  - Affected: copilot-pr-nlp-analysis, daily-architecture-diagram, daily-code-metrics, daily-function-namer, daily-mcp-concurrency-analysis, daily-performance-summary, daily-semgrep-scan, daily-workflow-updater, dependabot-go-checker, dictation-prompt, glossary-maintainer, gpclean, pdf-summary, pr-nitpick-reviewer, schema-feature-coverage, smoke-agent-all-merged, smoke-claude, smoke-gemini, test-dispatcher, workflow-skill-extractor
- AI Moderator: action_required on closed PRs - confirmed expected behavior (not a bug)

## RECOVERED ✅ (this week)
- PR Triage Agent: RECOVERED fully (9 consecutive successes after 21-run outage Mar 16-20)
- Issue Triage Agent: RECOVERED (run #136 Mar 20) - 15+ day outage resolved
- Smoke Gemini: Holding recovery (3+ consecutive schedule successes)
- Contribution Check: Improved 67% → 90% (9/10 most recent runs - pre-existing safe_outputs issue appears resolved)

## Scores (Latest - 2026-03-22 17:30Z)
Q:82 → | E:74 → | H:69 ↓5

## Ecosystem
- Total workflows: 177 (20 stale lock files, need recompile)
- Key metrics:
  - Issue Monster: 30/30 ✅
  - Smoke Copilot: 88% ✅
  - Smoke Claude: 80% ✅
  - PR Triage Agent: 9/9 consecutive ✅ (RECOVERED)
  - Smoke Update Cross-Repo PR: 0/6+ ❌ P1 (issue #aw_sxrpr1)
  - Daily Rendering Scripts Verifier: RECOVERING (2/2 recent) 🎉
- Last Agent Performance Run: 2026-03-22T17:30Z §23408443798
- Last Health Run: 2026-03-22T07:25Z §23398187371
