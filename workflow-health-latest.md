# Workflow Health - 2026-04-02T12:05Z

Score: 75/100 (↑1 from 74). 179 workflows total. Run: §23899445141

## 🆕 New P1 This Run
- **Smoke Multi PR**: 5/5 schedule runs failing (Mar 29 – Apr 2). Error: `add_comment` safe output with `target: triggering` fails on schedule runs (no issue/PR context). Issue created #aw_smkMulti01. Root: status-comment: true on schedule triggers.

## P1 Issues (Active)
- **Smoke Multi PR** (NEW): safe_outputs fails on schedule. See issue created this run.

## P2 (Team decided "not_planned")
- **Smoke Update Cross-Repo PR** (#23193 closed not_planned): Still failing schedule. Root: push_repo_memory git branch bug.
- **Smoke Create Cross-Repo PR** (#23715 closed not_planned): Still failing schedule. Same root cause.
- **Smoke Codex** (#23431 closed): API restriction. Still failing.
- **Smoke Gemini** (#23399 closed): Exit code 41. Still failing.

## Watch
- **Smoke Claude** (#23528, #23067 open): Schedule run #2613 (Apr 2) SUCCESS. #2611 (Apr 1) failed. ~25-30% failure rate. MCP 412s timeout intermittent. ~$10-15/week cost.
- **Schema Consistency Checker**: APR noted model_downgrade_available 4/5 runs.

## Stale Lock Files (10)
commit-changes-analyzer, copilot-pr-nlp-analysis, daily-mcp-concurrency-analysis, daily-rendering-scripts-verifier, developer-docs-consolidator, github-mcp-tools-report, issue-monster, plan, security-compliance, weekly-issue-summary

## Recovered This Run
(No new recoveries)

## Previously Recovered
- PR Triage Agent: Close #23151 manually (9+ successes)

## Actions Taken This Run
- Created WHM Dashboard issue for 2026-04-02 (#aw_whmDash02)
- Created Smoke Multi PR P1 issue (#aw_smkMulti01)
- Commented on #23881 (previous dashboard) with update summary

## Systemic Issues
1. **status-comment on schedule**: Smoke Multi PR fails because add_comment target:triggering fails hard on schedule runs. May affect other workflows.
2. **push_repo_memory → Post Setup Scripts**: Smoke Update + Create cross-repo PR. Team decided not_planned.
3. **Smoke Claude MCP timeout**: HTTP closes at 412s. ~$10-15/week. #23528 #23067.
4. **Codex/Gemini API access**: External APIs restricted. Team closed as not_planned.

## Run Info
- Timestamp: 2026-04-02T12:05Z
- Run: §23899445141
- Score: 74→75 (↑1)
