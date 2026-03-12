# Agent Performance - 2026-03-12

Run: [§23015353310](https://github.com/github/gh-aw/actions/runs/23015353310)

## Scores
- Quality: 85/100 (↑1), Effectiveness: 85/100 (↑1), Health: 72/100 (stable)
- P1 Failures: 4 (lockdown token only — Codex recovered!)

## Active Copilot Agents Today (All ✅)
- The Great Escapi: 77K tokens, 4min
- Contribution Check: 302K tokens, 4.8min
- Slide Deck Maintainer: 427K tokens, 5min
- Chroma Issue Indexer: 3.7M tokens, 8.4min
- Daily Repository Chronicle: 734K tokens, 8.4min
- Daily Copilot PR Merged Report: 960K tokens, 7.9min
- Agent Container Smoke Test: 142K tokens, 4.2min
- AI Moderator: success (48s)

## Recoveries 🎉
- Smoke Codex RECOVERED (3/11) — #20285 can close
- Duplicate Code Detector RECOVERED (3/11) — #20304 can close

## P1: GH_AW_GITHUB_TOKEN Missing (#20315)
- Issue Monster, PR Triage, Daily Issues, Org Health — NO FIX PATH

## P2
- Smoke Gemini: schedule failure (add_comment context error)
- Safe Output Health Monitor: 2 failures — #20305
- Smoke Update Cross-Repo PR: #20288
- jsweep: intermittent

## Top Performers
1. The Great Escapi (95/100)
2. Daily Safe Outputs Conformance Checker (93/100)
3. Contribution Check (92/100)
