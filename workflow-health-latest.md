# Workflow Health - 2026-04-03T12:03Z

Score: 72/100 (↓3 from 75). 183 workflows total. Run: §23945470700

## 🆕 New P1 This Run
- **Daily Fact About gh-aw** (NEW): Old lock file format — uses `github/gh-aw-actions/setup@v0` which doesn't exist on `gh-aw-actions` repo (latest: `v0.65.7`). Fails in activation job. 9 consecutive failures (Mar 25–Apr 3). Issue created: #aw_dailyFact1. Fix: recompile `daily-fact.md`.

## P1 Issues (Active)
- **Daily Fact About gh-aw** (NEW): Old format lock file, `@v0` tag missing. Issue #aw_dailyFact1. Fix: `gh aw compile daily-fact.md`
- **Duplicate Code Detector**: Codex API safety restriction (cybersecurity). 7 failures. Auto-issue #24284. Externally blocked.
- **Daily Issues Report Generator**: Agent job fails at `Fetch issues data`. 11 failures since Mar 24. Auto-issue #24266. Needs investigation.

## Resolved This Run
- **Smoke Multi PR**: Schedule run #622 (Apr 3) SUCCESS. Issue #24096 closed. Root: status-comment on schedule fixed.

## Watch
- **Smoke Claude** (#23528, #23067 open): Schedule Apr 3 SUCCESS. Intermittent ~25-30% failure, MCP 412s timeout. Also #23919 (safe-outputs filename mismatch, assigned to Copilot).
- **Schema Consistency Checker**: model_downgrade_available pattern. Watching.

## Stale Lock Files (19) — ↑9 from last run (was 10, all previous 10 were recompiled)
claude-token-usage-analyzer, code-simplifier, copilot-token-usage-analyzer, daily-cli-performance, daily-file-diet, daily-news, daily-testify-uber-super-expert, dependabot-go-checker, discussion-task-miner, example-workflow-analyzer, go-logger, hourly-ci-cleaner, poem-bot, prompt-clustering-analysis, schema-consistency-checker, semantic-function-refactor, smoke-copilot, terminal-stylist, workflow-normalizer

## P2 (Team decided "not_planned")
- **Smoke Update Cross-Repo PR**: Still failing. Root: push_repo_memory git branch bug.
- **Smoke Create Cross-Repo PR**: Still failing. Same root cause.
- **Smoke Codex**: API restriction. Team: not_planned.
- **Smoke Gemini**: Exit code 41. Team: not_planned.

## Actions Taken This Run
- Created WHM Dashboard #aw_whmDash03 (2026-04-03)
- Created Daily Fact P1 issue #aw_dailyFact1
- Confirmed Duplicate Code Detector auto-issue #24284
- Confirmed Daily Issues Report auto-issue #24266

## Systemic Issues
1. **Codex API safety restrictions**: Duplicate Code Detector blocked by OpenAI safety check. May affect other Codex workflows doing cybersecurity/code analysis.
2. **Stale lock files spike (19)**: Active .md file changes without recompile. Run `make recompile`.
3. **Old lock file format**: `daily-fact.lock.yml` uses legacy remote action refs. Recompile to fix.

## Run Info
- Timestamp: 2026-04-03T12:03Z
- Run: §23945470700
- Score: 75→72 (↓3)
