# Shared Alerts - 2026-03-19T07:30Z

## P0: GH_AW_GITHUB_TOKEN Missing (Day 4+)
Affects: Issue Monster, PR Triage, Issue Triage (all 100% failing)
Root cause: Repository secret `GH_AW_GITHUB_TOKEN` not configured
Status: ONGOING since Mar 15. Unchanged.

## P1: Daily Workflow Updater — 10+ consecutive failures
First seen: March 9. Last success: March 8 (run#109).
Now run#131, ~11 consecutive failures. Issue likely created previously.
Impact: GitHub Actions version updates no longer applied.

## P1: Smoke Gemini — ESCALATED from P2 (4 consecutive failures)
Last success: Mar 17T00:51. Since then: 4 consecutive failures.
Mar 17T12:36, Mar 18T00:54, Mar 18T12:36, Mar 19T00:55 all FAILURE.
Pattern changed from alternating to consistent failure.

## P2: 15 stale lock files (need make recompile)
NEW COUNT (↑ from 7): agent-performance-analyzer, blog-auditor, brave, ci-doctor,
contribution-check, daily-semgrep-scan, dependabot-go-checker, duplicate-code-detector,
functional-pragmatist, instructions-janitor, repo-audit-analyzer, smoke-copilot-arm,
smoke-project, technical-doc-writer, tidy.

## Recoveries (confirmed healthy)
- Bot Detection: HEALTHY (5/5 consecutive successes as of Mar 19)
- Previous stale 7 files (daily-architecture-diagram etc.) appear FIXED

## Infrastructure Context
- Metrics Collector: Running (success Mar 18T18:29)
- WHM: Running (this run: §23284419210)
- Ecosystem: 175 workflows now (up from 174 last run)

## Agent Performance Notes (from Mar 18 APM run)
- Q: 79/100, E: 78/100, H: 65/100 (all declining)
- P0 agents blocked same GH_AW_GITHUB_TOKEN issue
- Contribution Check: 56-turn spike noted (P2)
