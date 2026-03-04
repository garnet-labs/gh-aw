# Agent Performance Analysis - 2026-03-04

**Run:** [§22681140788](https://github.com/github/gh-aw/actions/runs/22681140788)
**Status:** ⚠️ DEGRADED — AI Moderator day 7+ (OpenAI cybersec); Smoke Codex NEW failure (same restriction); Issue Monster lockdown ongoing

## Scores

- **Agent Quality:** 84/100 (↓1 from 85 — Smoke Codex regression)
- **Agent Effectiveness:** 84/100 (↓1 from 85)
- **Critical Issues:** 3 active ❌ (Lockdown P0 ongoing, AI Moderator day 7+, Smoke Codex NEW)
- **Total Runs (7-day):** 50 | Errors: 10 | Tokens: 20.3M | Cost: $4.27

## Key Changes

| Metric | Previous (3/1) | Current (3/4) | Trend |
|--------|----------------|---------------|-------|
| Agent Quality | 85/100 | 84/100 | ↓ 1 |
| Agent Effectiveness | 85/100 | 84/100 | ↓ 1 |
| Changeset Generator cost | ~unknown | 10.4M tokens | 🔴 very high |
| AI Moderator failure | Day 3 | Day 7+ | ❌ worsening |
| Smoke Codex failure | PASSING | NOW FAILING | ❌ NEW regression |
| Issue Monster lockdown | 4 failures | 4 failures (3d) | ❌ unchanged |

## Top Performers

1. **The Great Escapi (95/100):** 75K tokens, 4.1m — ultra-efficient, consistent pass
2. **Daily Safe Outputs Conformance Checker (93/100):** 164K tokens — clean
3. **Contribution Check (92/100):** 301K tokens — clean pass
4. **Agent Container Smoke Test (88/100):** 139K tokens, 1S/0F
5. **Smoke Claude/Copilot (90/100):** Smoke tests passing ✅

## Critical Issues

- ❌ **NEW P1: Smoke Codex (#2142)** — OpenAI cybersec restriction NOW affecting Smoke Codex too
  - Same error as AI Moderator: "access temporarily limited for cybersecurity activity"
  - Run: 22676642094 | This is a NEW regression from previous week
- ❌ **P1 ONGOING: AI Moderator (day 7+)** — Issue #18922 OPEN, expires 2026-03-07 ⚠️
- ❌ **P0 ONGOING: Issue Monster + 3 workflows** — lockdown token missing, no fix path

## Agents Needing Attention

- **AI Moderator (0/100):** 7+ days failure — OpenAI cybersec restriction — #18922 OPEN ⚠️ EXPIRING 3/7
- **Smoke Codex (0/100 this run):** NEW failure — same OpenAI cybersec restriction
  - **Scope is EXPANDING** — both codex-engine workflows now blocked
- **Issue Monster (0/100 this run):** 4 failures (3d) — lockdown token missing
- **Changeset Generator:** 10.4M tokens in 1 run — highest by far, monitor cost

## Token Usage (7-day, top spenders)

1. Changeset Generator: 10.4M tokens (1 run) 🔴 highest
2. Chroma Issue Indexer: 3.3M tokens (1 run)
3. Semantic Function Refactoring: 2.96M tokens (1 run, was $2.36→$1.72 improving)
4. Slide Deck Maintainer: 1.26M tokens (1 run)
5. The Daily Repository Chronicle: 1.06M tokens (1 run)

## NEW Issues Created This Run

- Create issue for Smoke Codex NEW failure

## Run Info
- Timestamp: 2026-03-04T17:31:28Z
- Workflow run: [§22681140788](https://github.com/github/gh-aw/actions/runs/22681140788)
- Health score: 84/100 (↓1 from 85)
