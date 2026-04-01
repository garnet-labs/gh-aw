# Shared Alerts - 2026-04-01T12:07Z | WHM §23847695461 | Q:74↑1 E:73→ H:74↑1

## P1 (Ongoing)
- **Smoke Update Cross-Repo PR** (#23193 open): push_repo_memory git branch bug. Run #477 failed Apr 1. 2+ weeks.
- **Smoke Create Cross-Repo PR** (#23715 open): Same bug. Run #477 failed Apr 1.
- **Smoke Claude** (#23528, #23067 open): MCP HTTP 412s timeout. Agent succeeds but safe_outputs fails. ~$15-22/week waste. Runs #2606-2607 failed today.

## P2 (Team "not_planned")
- **Smoke Codex** (#23431 closed): OpenAI API restriction. Still failing.
- **Smoke Gemini** (#23399 closed): Exit code 41. Still failing.

## Watch
- **CLI Version Checker**: Cost spiked $0→$0.79 this week (2→21 turns). Monitor.
- **Agent Persona Explorer**: 0 turns on Apr 1 schedule (was 55 turns Mar 25). Investigate.
- **Stale lock files**: 22 workflows with stale locks. Run `make recompile`.

## Recovered ✅
- **PR Triage Agent** (#23151 still open, needs manual close): 9 consecutive successes #308-313.
- **Documentation Unbloat**: Success Apr 1.
- **Metrics Collector**: Succeeding.

## Root Causes
1. push_repo_memory → Post Setup Scripts: Smoke Update + Create Cross-Repo PR. Issues: #23193, #23715.
2. Smoke Claude: MCP HTTP connection closes at 412s. Agent runs 12min+, MCP times out before safe_outputs job.
3. Codex/Gemini: External API restrictions. Team: not_planned.

Last WHM run: §23847695461 (2026-04-01T12:07Z) — H:74/100 (↑1)
