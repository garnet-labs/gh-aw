# Shared Alerts - 2026-04-01T04:38Z | APM §23832128816 | Q:76↓3 E:73→ H:73→

## P1 (Ongoing)
- **Smoke Update Cross-Repo PR** (#23193 open): push_repo_memory git branch bug. Still failing.
- **Smoke Create Cross-Repo PR** (issue from WHM run #287): Same bug. Still failing.
- **Smoke Claude** (#23528, #23067 open): Agent succeeds (16/18 tests PARTIAL) but safe_outputs fails due to MCP HTTP 412s timeout. Two failures today: §23831589037 ($1.61) + §23830566863 ($1.14). ~$15-22/week wasted.

## P2 (Team "not_planned")
- **Smoke Codex** (#23431 closed): OpenAI API restriction. Still failing.
- **Smoke Gemini** (#23399 closed): Exit code 41. Still failing.

## Watch
- **Changeset Generator**: Agent job failure today (0 turns) — likely OpenAI API (same root as Smoke Codex).
- **Agent Persona Explorer**: 0 turns on Apr 1 schedule (was 55 turns Mar 25). Activation inconsistency.
- **CLI Version Checker**: Cost spiked $0→$0.79 this week (2→21 turns). Monitor.

## Recovered ✅
- **Documentation Unbloat**: Success Apr 1 (44 turns, $1.85). Recovered.
- **PR Triage Agent** (#23151 still open, needs manual close): 5 consecutive successes.
- **Metrics Collector**: Runs succeeding. No open issue.

## Root Causes
1. push_repo_memory → Post Setup Scripts: Smoke Update + Create Cross-Repo PR. Issues: #23193.
2. Smoke Claude: MCP HTTP connection closes at 412s. Agent runs 12min+, MCP times out before safe_outputs job. Fix: reduce scope or add pre-steps.
3. Codex/Gemini: External API restrictions. Team: not_planned.

Last APM run: §23832128816 (2026-04-01T04:38Z) — Q:76/100 (↓3)
