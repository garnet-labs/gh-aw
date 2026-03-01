# Agent Performance Analysis - 2026-03-01

**Run:** [§22548582345](https://github.com/github/gh-aw/actions/runs/22548582345)
**Status:** ⚠️ MIXED — AI Moderator still failing (OpenAI cybersecurity restriction day 3); Semantic Function Refactoring improving significantly; P0 lockdown ongoing

## Scores

- **Agent Quality:** 85/100 (↑ 1 from 84)
- **Agent Effectiveness:** 85/100 (→ stable)
- **Critical Issues:** 2 active ❌ (Lockdown P0, AI Moderator OpenAI restriction)
- **Total Runs (2-day sample):** 32 | Errors: 11 | Tokens: 332.8M | Cost: $9.28

## Key Changes

| Metric | Previous (2/27) | Current (3/1) | Trend |
|--------|----------------|---------------|-------|
| Agent Quality | 84/100 | 85/100 | ↑ 1 |
| Agent Effectiveness | 85/100 | 85/100 | → stable |
| Semantic Function Refactoring cost | $2.36/run | $1.72/run | ↓ $0.64 ✅ |
| AI Moderator failure | OpenAI cybersec restriction | STILL FAILING | ❌ day 3 |
| Chroma Issue Indexer blocked | 74 (2d) | 124 (2d) | ↑ worsening |

## Top Performers

1. **The Great Escapi (95/100):** 74k tokens, 3.4m — ultra-efficient, consistent
2. **Daily Safe Outputs Conformance Checker (93/100):** 308k tokens, $0.49, 12 turns, 4.4m
3. **Contribution Check (92/100):** success on run #79, 8.6m — clean
4. **Agent Container Smoke Test (88/100):** 142k tokens, 3.4m

## Critical Issues

- ❌ **P0 ONGOING:** Issue Monster + 3 workflows — lockdown token missing, NO fix path
- ❌ **AI Moderator (day 3):** OpenAI cybersecurity restriction on gpt-5.3-codex — new issue created
  - Issue created this run for investigation/model switch

## Agents Needing Attention

- **AI Moderator (35/100):** 3+ days failure — OpenAI cybersec restriction on gpt-5.3-codex
- **Lockfile Statistics Analysis Agent (78/100):** $1.36/run, 1.06M tokens — monitor
- **Semantic Function Refactoring (82/100):** $1.72/run (↓ from $2.36) — improving, continue monitoring
- **Chroma Issue Indexer:** 124 blocked requests (2d) — increasing trend

## Firewall Analysis (2-day)

- Top blocked: Chroma Issue Indexer (124), Changeset Generator (101), Workflow Skill Extractor (87), Example: Custom Error Patterns (83), Lockfile Statistics (73), Daily Security Red Team (63)
- All "-" domain blocks = Serena MCP local socket pattern (expected)
- Changeset Generator has unexpected github.com/codeload.github.com blocks — needs investigation

## Issues Created This Run

- ❌ NEW: AI Moderator OpenAI cybersecurity restriction — issue created

## Actions

- Created AI Moderator issue for investigation
- Created weekly performance report discussion
