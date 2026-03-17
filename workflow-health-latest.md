# Workflow Health - 2026-03-17T07:32Z

Score: 68/100 (↓ from 72). 172 workflows, 172/172 compiled. 16 stale locks.

## P1 Critical
- **Issue Monster**: 100% failure (GH_AW_GITHUB_TOKEN missing) - `pre_activation` fails at "Generate GitHub App token for skip-if checks". 30/30 failures since March 15.
- **PR Triage Agent**: 100% failure (same token issue). 30/30 failures since March 15.
- **Bot Detection**: ESCALATED from "monitoring" → P1. 84% failure rate (11/13 since Mar 15, 13/20 overall). Failing in `precompute` step - "Precompute deterministic findings". First seen March 14, now consistently failing.

## Recoveries / Healthy ✅
- Smoke Copilot ✅, Smoke Claude ✅, Smoke Codex ✅, Smoke Gemini ✅
- Metrics Collector ✅, Agentic Maintenance ✅, Auto-Triage Issues ✅
- AI Moderator: action_required (approval gate, not broken)
- Contribution Check: continuing recovery trend
- Static Analysis Report ✅, CodeQL ✅, CI ✅

## P2 Warning
- 16 stale lock files (make recompile needed, down from 18)
- Stale: ai-moderator, ci-doctor, copilot-agent-analysis, copilot-pr-nlp-analysis, daily-architecture-diagram, daily-code-metrics, deep-report, docs-noob-tester, firewall-escape, pr-nitpick-reviewer, repository-quality-improver, scout, smoke-claude, smoke-gemini, sub-issue-closer, test-project-url-default

## Actions Taken This Run
- Bot Detection escalated to P1 tracking issue (new issue created)
- Dashboard issue updated with current status
- Updated shared-alerts.md with Bot Detection escalation

## Run Info
- Timestamp: 2026-03-17T07:32:00Z
- Run: §23183314863
