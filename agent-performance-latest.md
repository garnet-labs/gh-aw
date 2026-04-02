# Agent Performance - 2026-04-02
Run: §23883959022 | Q:75↓1 E:73→ H:74→

Top: Documentation Unbloat, CLI Version Checker, Issue Monster, Release, Auto-Triage
Recovered: Agent Persona Explorer, PR Triage Agent (9 successes - close #23151)

Watch NEW: Smoke Multi PR run #604 — 89 turns/12.3min (norm: 2–4t). resource_heavy+partially_reducible (96% data-gathering). Monitor next run; add turn budget.
Watch: Schema Consistency Checker — model_downgrade_available (4/5 runs); run #206 resource_heavy (108t,$1.73). Try smaller model.
Off Watch: CLI Version Checker (cost normalized $0.79→$0.59).

P1: Smoke Claude — 5/5 fail, MCP 412s timeout, ~$10-15/week. #23528 #23067
P1: Smoke Create/Update Cross-Repo PR — push_repo_memory bug. #23193 #23715

Stats: 179 wf, 32 agentic runs (7d). Claude: 8 runs $5.64. Copilot: 24 runs $0.
