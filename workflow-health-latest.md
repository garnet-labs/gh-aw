# Workflow Health - 2026-04-01T12:07Z

Score: 74/100 (↑1 from 73). 179 workflows total. Run: §23847695461

## ✅ Recovered This Run
- **PR Triage Agent** (#23151 still open, needs manual close): Runs #308-313 all SUCCESS. 9 consecutive successes. Fully recovered.

## P1 Issues (Ongoing)
- **Smoke Update Cross-Repo PR** (#23193, open): Run #477 failed 2026-04-01T01:07Z. Runs #418-477 ALL failing. Root: push_repo_memory git branch bug.
- **Smoke Create Cross-Repo PR** (#23715, open): Run #477 failed 2026-04-01T01:08Z. Same root cause. Issue #23715 (auto-created).

## P2 (Team decided "not_planned")
- **Smoke Codex** (#23431 closed): API restriction. Still failing.
- **Smoke Gemini** (#23399 closed): Exit code 41. Still failing.

## Watch
- **Smoke Claude** (#23528, #23067 open): PR-triggered runs #2606-#2607 failed today. Schedule #2605 succeeded. MCP timeout at 412s. ~$15-22/week wasted.

## Stale Lock Files (22)
bot-detection, commit-changes-analyzer, copilot-pr-merged-report, daily-cli-performance, daily-compiler-quality, daily-file-diet, daily-malicious-code-scan, daily-observability-report, daily-security-red-team, dependabot-go-checker, discussion-task-miner, github-mcp-tools-report, go-pattern-detector, jsweep, mergefest, refiner, repository-quality-improver, scout, smoke-agent-all-none, smoke-multi-pr, weekly-issue-summary, workflow-skill-extractor

## Actions Taken This Run
- Created WHM Dashboard issue (#aw_whmDash01) for 2026-04-01
- Commented on #23193 (Smoke Update run #477 still failing)
- Commented on #23715 (Smoke Create run #477 still failing)
- Commented on #23151 (PR Triage fully recovered, 9 successes, please close)

## Systemic Bugs
1. **push_repo_memory → Post Setup Scripts**: Affects Smoke Update + Smoke Create cross-repo PR. Issues: #23193, #23715. 2+ weeks unresolved.
2. **Smoke Claude MCP timeout**: HTTP connection closes at 412s. ~$15-22/week wasted.
3. **Codex/Gemini API access**: External APIs restricted. Team closed as not_planned.

## Run Info
- Timestamp: 2026-04-01T12:07Z
- Run: §23847695461
- Score: 73→74 (↑1)
