# Agent Performance Analysis - 2026-02-24

**Run:** [§22362703459](https://github.com/github/gh-aw/actions/runs/22362703459)
**Status:** ⚠️ DEGRADED — AI Moderator regression detected; non-IM success rate dropped to 95%
**Analysis Period:** 2026-02-17 → 2026-02-24 (7-day window, 27 runs)

## Executive Summary

- **Agent Quality:** 91/100 (↓ 1 from 92)
- **Agent Effectiveness:** 87/100 (↓ 1 from 88)
- **Critical Agent Issues:** 1 new ⚠️ (AI Moderator GitHub MCP intermittency)
- **Run Success Rate (non-IM):** 95% (20/21) ↓ from 100%
- **Total Tokens:** ~17.7M | **Estimated Cost:** ~$6.39 (7d window)
- **Total Runs:** 27 (21 success + 4 Issue Monster failures + 1 AI Moderator failure)
- **Total Turns:** 138

## Key Metrics

| Metric | Current | Previous | Change |
|--------|---------|----------|--------|
| Agent Quality | 91/100 | 92/100 | ↓ 1 |
| Agent Effectiveness | 87/100 | 88/100 | ↓ 1 |
| Non-IM Success Rate | 95% (20/21) | 100% (18/18) | ↓ 5% |
| Critical Issues | 1 (AI Moderator) | 0 | ↑ 1 |
| AI Moderator Score | 72/100 | 94/100 | ↓ 22 |

## 🔴 NEW: AI Moderator GitHub MCP Intermittency (3/6 runs missing tools)

GitHub MCP `mode: local` (Docker) intermittently unavailable. 3 runs completed as success/noop silently skipping moderation. 1 run outright failed.
- Failing run: [22361284967](https://github.com/github/gh-aw/actions/runs/22361284967)
- Missing-tool runs: 22361207226, 22359803227, 22358411348
- **~50% of AI Moderator triggers doing no moderation today**

## 🔥 P1 Still Burning: Issue Monster (4/4 failures today, 22nd+ period)
Fix in #17807 still not applied.

## Top Performing Agents

1. **The Great Escapi (95/100):** Security maintained, 6.1m
2. **CI Failure Doctor (93/100):** 3/3 success, 7.4m avg (active CI failures)
3. **Daily Safe Outputs Conformance Checker (92/100):** 1/1, 5.7m
4. **Lockfile Statistics Analysis Agent (92/100):** 1/1, 10.1m
5. **DeepReport (91/100):** 1/1, 9.0m

## ⚠️ Monitor

- **Daily Safe Output Tool Optimizer:** 14.7m — slowest non-meta workflow, watch for growth
- **AI Moderator MCP:** Consider switching to `mode: remote`

## Active Issues / Tracking

- ❌ **P1:** Issue Monster (+ PR Triage, Daily Issues, Org Health) failing — fix in #17807
- ⚠️ **NEW:** AI Moderator GitHub MCP degradation — needs investigation
- ✅ **All smoke tests:** Passing on main
