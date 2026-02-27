# Agent Performance Analysis - 2026-02-27

**Run:** [§22496664267](https://github.com/github/gh-aw/actions/runs/22496664267)
**Status:** ⚠️ MIXED — AI Moderator blocked by OpenAI cybersecurity restriction (new root cause); Semantic Function Refactoring improving significantly; P0 lockdown ongoing; Chroma Issue Indexer elevated blocked requests

## Scores

- **Agent Quality:** 84/100 (↓ 2 from 86)
- **Agent Effectiveness:** 85/100 (↓ 2 from 87)
- **Critical Issues:** 2 active ❌ (Lockdown P0, AI Moderator OpenAI restriction)
- **Total Runs (2-day sample):** 33 | Errors: 14 | Tokens: 20.7M | Cost: $9.22

## Key Changes

| Metric | Previous (2/26) | Current (2/27) | Trend |
|--------|----------------|----------------|-------|
| Agent Quality | 86/100 | 84/100 | ↓ 2 |
| Agent Effectiveness | 87/100 | 85/100 | ↓ 2 |
| Semantic Function Refactoring cost | $3.97/run | $2.36/run | ↓ $1.61 ✅ |
| AI Moderator failure | GitHub MCP missing | OpenAI cybersec restriction | ⚠️ NEW ROOT CAUSE |
| Chroma Issue Indexer blocked | 102 | 74 | ↓ improving |

## Top Performers

1. **The Great Escapi (95/100):** 74k tokens, 3.2m — ultra-efficient, consistent
2. **Daily Safe Outputs Conformance Checker (93/100):** 294k tokens, $0.46, 9 turns, 3.8m
3. **Contribution Check (92/100):** 507k tokens, 3.8m — clean success

## Critical Issues

- ❌ **P0 ONGOING:** Issue Monster + 3 workflows — lockdown token missing, NO fix path
- ❌ **NEW ROOT CAUSE:** AI Moderator failed — OpenAI blocked gpt-5.3-codex with cybersecurity restriction
  - Error: "This user's access to gpt-5.3-codex has been temporarily limited for potentially suspicious activity related to cybersecurity"
  - This is NOT a GitHub MCP issue — it's an OpenAI model-level access restriction
  - Requires investigation: why did AI Moderator trigger cybersecurity checks?

## Agents Needing Attention

- **AI Moderator (60/100):** OpenAI cybersecurity restriction blocking codex access — new critical issue
- **Semantic Function Refactoring (73/100):** $2.36/run, 2.45M tokens, 85 turns — cost dropping but still elevated
- **CI Failure Doctor (70/100):** 1.35M tokens per run — investigate token usage spike
- **Chroma Issue Indexer (68/100):** 74 blocked firewall requests (2d) — highest blocked count

## Firewall Analysis (2-day)

- Top blocked: Chroma Issue Indexer (74), Slide Deck Maintainer (63), Semantic Function Refactoring (64), Daily Security Red Team (58)
- All "-" domain blocks = Serena MCP local socket pattern (known/expected)

## Issues Tracked

- ❌ P0: #17387 Issue Monster lockdown — OPEN (ongoing, NO fix path)
- ⚠️ #18388: Semantic Function Refactoring high cost — OPEN (improving, $2.36 today)
- ⚠️ NEW: AI Moderator OpenAI cybersecurity restriction (2026-02-27)
