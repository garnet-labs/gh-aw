# Shared Alerts - 2026-03-23T07:38Z

## P1 Active
- **Smoke Update Cross-Repo PR**: 0/10+ schedule failures (8+ days, 100% outage). Issue #22241 filed and updated. Label resolution or PR state mismatch suspected.
- **Issue Triage Agent**: Partial recovery - 1 success (run #136, Mar 20) after 5+ consecutive failures. No runs observed Mar 21-22 (may have run but not indexed). Monitor closely.

## P2 Active
- 19 stale lock files (NEW set since previous 20): claude-code-user-docs-review, code-scanning-fixer, constraint-solving-potd, daily-copilot-token-report, daily-malicious-code-scan, daily-repo-chronicle, delight, developer-docs-consolidator, github-mcp-structural-analysis, glossary-maintainer, go-pattern-detector, pdf-summary, portfolio-analyst, security-review, smoke-agent-public-approved, smoke-codex, smoke-workflow-call, super-linter, workflow-normalizer
  - Indicates ongoing code churn; `make recompile` needed
- Smoke Create Cross-Repo PR: intermittent failures (run #293 failed Mar 23, #285 failed Mar 21), ~75% success rate

## RECOVERED ✅ (this week)
- PR Triage Agent: HOLDING recovery - 10+ consecutive successes
- Daily Rendering Scripts Verifier: HOLDING recovery - 2/2 recent schedule successes (was 43+ consecutive failures)
- Smoke Gemini: SOLIDIFIED recovery - 5/5 consecutive schedule successes (Mar 21-23)
- Issue Triage Agent: Partial recovery (1 success Mar 20 after long outage) - monitor
- Contribution Check: 89% success rate (stable)

## Scores (Latest - 2026-03-23 07:38Z)
Q: -- | E: -- | H:71 ↑2

## Ecosystem
- Total workflows: 177 (19 stale lock files)
- Key metrics:
  - Issue Monster: 10/10 ✅
  - Smoke Copilot: 88% ✅
  - Smoke Claude: 80% ✅
  - Smoke Gemini: 5/5 consecutive ✅ (SOLIDIFIED)
  - Smoke Codex: 87% ✅
  - PR Triage Agent: 10/10 ✅ (FULLY RECOVERED)
  - Auto-Triage Issues: 6/6 ✅
  - Metrics Collector: 8/8 ✅
  - Smoke Update Cross-Repo PR: 0/10+ ❌ P1 (issue #22241)
  - Daily Rendering Scripts Verifier: HOLDING recovery (2/2 recent) 🎉
  - Issue Triage Agent: Partial recovery (1/1 most recent) ⚠️
- Last Health Run: 2026-03-23T07:38Z §23426422007
