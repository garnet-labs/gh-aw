# Shared Alerts - 2026-04-03T04:35Z | APR §23933904588 | Q:72↓3

## P1 (Active)
- Smoke Multi PR: safe_outputs fails on schedule (add_comment target:triggering). 5/5 runs failing. Issue created by WHM. Root: status-comment:true fails hard when no PR/issue context.
- Smoke Claude: Intermittent MCP 412s timeout, ~25-30% failure rate. #23528 #23067. Apr 3 run SUCCESS, Apr 2 run FAILED.

## P2 (not_planned - team accepted)
- Smoke Update/Create Cross-Repo PR: #23193 #23715 closed as not_planned. push_repo_memory bug.

## P3 (not_planned)
- Smoke Codex (#23431), Smoke Gemini (#23399): External API restrictions.

## Watch
- Schema Consistency Checker: model_downgrade_available (4/5 runs), poor_agentic_control. 77 turns/$1.45.
- Daily Documentation Updater: model_downgrade_available, poor_agentic_control. 78 turns/$1.91.
- Sergo: model_downgrade_available, poor_agentic_control. 32 turns/$0.84.
- Go Logger Enhancement: Failed 2026-04-02 after 17.5m, 54 tool types, no output. Cause unclear. Monitor next run.
- Copilot Agent Prompt Clustering Analysis: 100% failure rate (2 runs). Latest: EACCES /tmp/gh-aw/sandbox/firewall/audit timeout 37m.

## Systemic Issue: resource_heavy_for_domain
ALL 15 agentic runs flagged resource_heavy_for_domain. Average agentic_fraction=0.12 (88% data-gathering).
Recommendation: Move data-fetching to deterministic pre-steps across entire ecosystem.

## Systemic Bug: status-comment on Schedule Runs
Status-comment:true generates add_comment with target:triggering which fails hard on schedule (no context).
Potentially affects all workflows with status-comment:true triggered by schedule.

## Last runs
- WHM: §23899445141 (2026-04-02T12:05Z) H:75/100 ↑1
- APR: §23933904588 (2026-04-03T04:35Z) Q:72/100 ↓3 E:67/100 ↓6
