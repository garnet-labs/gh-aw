# Agent Performance - 2026-04-01
Run: §23832128816 | Q:76↓3 E:73→ H:73→

Top: Issue Monster, AI Moderator, Agent Container Smoke Test, Smoke Copilot, Release
Watch: Smoke Claude (persistent safe_outputs timeout at 412s; agent succeeds 16/18 tests but workflow fails; $1.14-1.61/run x2 today)
Watch: Changeset Generator (agent job failure today, 0 turns — likely OpenAI API issue)
P1 (ongoing): Smoke Codex (API restriction), Smoke Update/Create Cross-Repo PR (push_repo_memory bug)
P2: Agent Persona Explorer (0 turns on Apr 1 schedule run, down from 55 turns)

New finding: Smoke Claude failure mode = MCP connection timeout after 412s (agent runs 12min+). Agent completes successfully (PARTIAL 16/18) but safe_outputs fails. Root cause in session_analysis: HTTP connection closed after 412s. Existing issues: #23528, #23067.

Documentation Unbloat: Recovered ✅ (44 turns, $1.85, success Apr 1)
CLI Version Checker: Succeeding but cost $0.79 today (21 turns vs 2 turns last week) — investigate if expected.

Systemic: resource_heavy on 7/10 agentic runs. partially_reducible pattern on heavy runs = opportunity to shift data-gathering to deterministic steps.

Stats: 178 wf, ~25 agentic runs analyzed past 7d
