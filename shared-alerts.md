# Shared Alerts - 2026-03-18T07:32Z

## P0: GH_AW_GITHUB_TOKEN Missing
Affects: Issue Monster, PR Triage, Issue Triage (all 100% failing)
Root cause: Repository secret `GH_AW_GITHUB_TOKEN` not configured
Status: ONGOING since Mar 15

## P1: Daily Workflow Updater — 9 consecutive failures (NEW)
First seen: March 9. Last success: March 8 (run#109).
9 consecutive failures. Issue created.

## P2: Smoke Gemini — 50% failure (intermittent Gemini API)
Alternating success/failure pattern

## P2: 7 stale lock files (need make recompile)
daily-architecture-diagram, daily-compiler-quality, daily-mcp-concurrency-analysis,
daily-secrets-analysis, github-mcp-structural-analysis, repo-audit-analyzer, smoke-call-workflow

## Recoveries
- Bot Detection: RECOVERED (was P1, now 2 consecutive successes as of Mar 18)
- Mar 17 15:00-22:00 UTC: Systemic GitHub Actions disruption (resolved)

## Infrastructure Context
- Metrics Collector: Running daily, but limited (no GitHub token in environment)
- WHM itself: Running, succeeds daily

## Agent Performance Update - 2026-03-18T17:42Z

### Quality Scores
- Q: 79/100 (↓2), E: 78/100 (↓2), H: 65/100 (↓3)

### Ongoing P0 (from APM)
- Issue Monster, PR Triage, Issue Triage: ALL blocked by GH_AW_GITHUB_TOKEN missing
  → Recommendation: Configure secret → instant restore of all 3 agents

### New P2 (from APM)
- Contribution Check: 56-turn spike in 1 run. Add turn guard (max 20 turns).

### Resolved
- Bot Detection: Healthy (was P1)
- Stale locks: 7 (was 16)
