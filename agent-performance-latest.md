# Agent Performance Analysis - 2026-02-26

**Run:** [§22453850435](https://github.com/github/gh-aw/actions/runs/22453850435)
**Status:** ⚠️ MIXED — AI Moderator GitHub MCP missing tool recurring; Semantic Function Refactoring cost still elevated; Chroma/Changeset Generator extreme token usage; Lockdown P1 failures ongoing
**Analysis Period:** 2026-02-25 → 2026-02-26 (1-day focus)

## Executive Summary

- **Agent Quality:** 86/100 (↓ 3 from 89 yesterday)
- **Agent Effectiveness:** 87/100 (↓ 1 from 88)
- **Critical Agent Issues:** 1 ongoing ❌ (Lockdown P0 — no fix path)
- **New Concerns:** AI Moderator GitHub MCP missing tool (1/3 runs), Chroma Issue Indexer extreme tokens (3.6M)
- **Total Cost (today):** ~$5.94 | **Total Tokens (sample):** ~165M (inc. Codex parallelism)
- **Total Runs (sample):** 31 (16 successful agent runs)

## Key Metrics

| Metric | Current | Previous | Change |
|--------|---------|----------|--------|
| Agent Quality | 86/100 | 89/100 | ↓ 3 |
| Agent Effectiveness | 87/100 | 88/100 | ↓ 1 |
| Semantic Function Refactoring cost | $3.97/run | $4.82/run | ↓ $0.85 |
| AI Moderator MCP success | 2/3 | 11/11 | ↓ 9 |
| Chroma Issue Indexer tokens | 3.6M | unknown | NEW high |

## Top Performing Agents

1. **The Great Escapi (94/100):** 74k tokens, 3.5m — ultra-efficient, security maintained
2. **Contribution Check (93/100):** 181k tokens, 2.8m — fast, clean success
3. **Daily Safe Outputs Conformance Checker (92/100):** 134k tokens, 3.1m, $0.33 — efficient
4. **Auto-Triage Issues (90/100):** 136k tokens, 3.5m — success, normal output
5. **Agent Container Smoke Test (90/100):** 174k tokens, 4.4m — clean
6. **Smoke Copilot (90/100):** 49 turns, 6.7m — full test passing

## ⚠️ Agents Needing Attention

- **AI Moderator (82/100):** 1/3 runs missing GitHub MCP read-issue tool (run #22453521501)
  - Pattern: `codex` engine, missing tool issue is *returning* after yesterday's full recovery
  - Runs 2 and 3 succeeded (2 turns each) but with low turn count — may be noop
- **Semantic Function Refactoring (72/100):** $3.97/run, 295k tokens, 12 turns — cost improving slightly but still elevated; 72 blocked firewall requests
- **Chroma Issue Indexer (68/100):** 3.6M tokens, 10.5m, 102 blocked firewall requests — HIGHEST blocked count
- **Changeset Generator (70/100 codex):** 123M tokens — extremely high (likely Codex parallelism pattern)
- **Scout (80/100):** 613k tokens, 19 turns, $0.81 — moderate cost, active

## Firewall Analysis

- Total: 926 requests | Allowed: 487 (53%) | Blocked: 439 (47%)
- Top blocked workflows: Chroma Issue Indexer (102), Semantic Function Refactoring (72), Changeset Generator (61), Slide Deck Maintainer (43)
- "-" domain still appearing in blocked list — consistent with Serena MCP local socket pattern

## Active Issues / Tracking

- ❌ **P0 ONGOING:** Issue Monster + 3 workflows — lockdown token missing, NO fix path
- ⚠️ **RECURRING:** AI Moderator GitHub MCP missing tool — 1/3 runs today (was 11/11 yesterday)
- ⚠️ **WATCH:** Semantic Function Refactoring cost — $3.97 today (was $4.82), improving slowly
- ⚠️ **NEW CONCERN:** Chroma Issue Indexer — 3.6M tokens and 102 blocked requests
- 🔖 **EXISTING:** Issue #18388 — Semantic Function Refactoring high cost

## Release Activity

- ✅ Release workflow ran successfully (11.4m, run #22452584938) — new release published today
