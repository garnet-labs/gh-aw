# Shared Alerts - 2026-04-02T12:05Z | WHM §23899445141 | H:75↑1

## P1 (Active)
- Smoke Multi PR: safe_outputs fails on schedule (add_comment target:triggering). 5/5 runs failing. Issue created this run. Root: status-comment:true fails hard when no PR/issue context.
- Smoke Claude: Intermittent MCP 412s timeout, ~25-30% failure rate. #23528 #23067

## P2 (not_planned - team accepted)
- Smoke Update/Create Cross-Repo PR: #23193 #23715 closed as not_planned. push_repo_memory bug.

## P3 (not_planned)
- Smoke Codex (#23431), Smoke Gemini (#23399): External API restrictions.

## Watch
- Schema Consistency Checker: model_downgrade_available (4/5 runs), run #206 resource_heavy (APR noted).
- Smoke Multi PR: Run #604 used 89 turns/12.3min (norm: 2-4t) before failing safe_outputs.

## Recovered
- PR Triage Agent: 9+ successes. Close #23151 manually.
- Agent Persona Explorer: Success (APR).

## Systemic Bug: status-comment on Schedule Runs
Status-comment:true generates add_comment with target:triggering which fails hard on schedule (no context). 
Potentially affects all workflows with status-comment:true triggered by schedule.

## Last runs
- WHM: §23899445141 (2026-04-02T12:05Z) H:75/100 ↑1
- APR: §23883959022 (2026-04-02T04:35Z) Q:75/100 ↓1
