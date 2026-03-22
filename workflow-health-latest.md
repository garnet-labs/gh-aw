# Workflow Health - 2026-03-22T07:25Z

Score: 69/100 (↓5 from 74). 177 workflows, 20 stale lock files (↑20 regression).

## P1 Issues
- **Smoke Update Cross-Repo PR**: 0/6 schedule failures (100% failure rate, 7+ days). Issue created #aw_sxrpr1. Companion create workflow healthy (83%).
- **Daily Rendering Scripts Verifier**: schedule still failing (P1 pre-existing, tracked). Manual dispatch succeeded (run #44 Mar 21).

## P2 Warning
- 20 stale lock files appeared since Mar 21 17:25Z (need `make recompile`):
  copilot-pr-nlp-analysis, daily-architecture-diagram, daily-code-metrics, daily-function-namer,
  daily-mcp-concurrency-analysis, daily-performance-summary, daily-semgrep-scan, daily-workflow-updater,
  dependabot-go-checker, dictation-prompt, glossary-maintainer, gpclean, pdf-summary, pr-nitpick-reviewer,
  schema-feature-coverage, smoke-agent-all-merged, smoke-claude, smoke-gemini, test-dispatcher,
  workflow-skill-extractor
- Contribution Check: safe_outputs failure on schedule (pre-existing, 67% success)
- AI Moderator: action_required on closed PRs (expected)

## Recoveries 🎉
- **PR Triage Agent**: RECOVERED! 9 consecutive successes after 21-run outage (Mar 16-20)
- **Smoke Gemini**: Holding recovery (3 consecutive schedule successes)

## Healthy
- Issue Monster ✅ 30/30 (100%) | PR Triage Agent ✅ (RECOVERED)
- Smoke Copilot ✅ 88% | Smoke Claude ✅ 80% | Smoke Gemini ✅ (recovering)
- Metrics Collector ✅ 5/5 scheduled | Smoke Codex ✅

## Actions Taken
- Created issue for Smoke Update Cross-Repo PR (P1)
- Updated dashboard issue #22108
- Updated shared-alerts.md

## Run Info
- Timestamp: 2026-03-22T07:25:00Z
- Run: §23398187371
- Score change: 74→69 (↓5)
