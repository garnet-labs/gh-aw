# Workflow Health - 2026-03-23T07:38Z

Score: 71/100 (↑2 from 69). 177 workflows, 19 stale lock files (↓1 from 20).

## P1 Issues
- **Smoke Update Cross-Repo PR**: 0/10+ schedule failures (100% failure rate, 8+ days). Issue #22241 exists (updated this run). Latest failure: run #292 (2026-03-23T01:04).
- **Issue Triage Agent**: Partial recovery - 1 success (run #136, Mar 20) after 5+ consecutive failures. No runs Mar 21-22. Monitor closely.

## Recoveries 🎉
- **Daily Rendering Scripts Verifier**: HOLDING recovery! 2 successes (run #45 Mar 22 schedule + run #44 Mar 21 dispatch). Still monitoring.
- **Smoke Gemini**: SOLIDIFIED recovery - 5 consecutive schedule successes (Mar 21-23). Upgraded from recovering → healthy.
- **PR Triage Agent**: Fully recovered - 10 consecutive schedule successes.

## P2 Warnings
- 19 stale lock files (DIFFERENT set from previous 20): claude-code-user-docs-review, code-scanning-fixer, constraint-solving-potd, daily-copilot-token-report, daily-malicious-code-scan, daily-repo-chronicle, delight, developer-docs-consolidator, github-mcp-structural-analysis, glossary-maintainer, go-pattern-detector, pdf-summary, portfolio-analyst, security-review, smoke-agent-public-approved, smoke-codex, smoke-workflow-call, super-linter, workflow-normalizer
  - These are a DIFFERENT set from previous run's stale list - indicates active code churn requiring recompile

## Healthy Key Workflows ✅
- Issue Monster: 10/10 schedule ✅
- PR Triage Agent: 10/10 schedule ✅ (RECOVERED, holding)
- Auto-Triage Issues: 6/6 schedule ✅
- Metrics Collector: 8/8 schedule ✅
- Smoke Copilot: 5/7 schedule ✅ (88%)
- Smoke Claude: 8/10 schedule ✅ (80%, occasional transient failures)
- Smoke Gemini: 5/5 consecutive ✅ (SOLIDIFIED recovery)
- Smoke Codex: 7/8 schedule ✅ (87%)
- Contribution Check: 8/9 recent ✅ (89%)

## Actions Taken
- Updated issue #22241 (Smoke Update Cross-Repo PR P1) with latest data (run #292 failure, 8+ consecutive)
- Updated shared-alerts.md
- Updated memory

## Run Info
- Timestamp: 2026-03-23T07:38:00Z
- Run: §23426422007
- Score change: 69→71 (↑2)
