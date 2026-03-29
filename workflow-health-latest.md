# Workflow Health - 2026-03-29T12:00Z

Score: 71/100 (↑1 from 70). 178 workflows, 8 stale lock files (same-second timestamps, low concern).

## P1 Issues
- **PR Triage Agent**: ✅ RECOVERED — Run #301 (2026-03-29T06:21Z) SUCCEEDED after 12 consecutive failures. Issue #23151 open (monitor for 2-3 more runs). Added recovery comment this run.
- **Smoke Update Cross-Repo PR**: Schedule run #434 (2026-03-29T01:04Z) FAILED. PR runs mixed (436 fail, 437 success). Same systemic push_repo_memory bug. Issue #23193 open. Added status comment this run.
- **Smoke Create Cross-Repo PR**: Every schedule run failing since at least run #383 (2026-03-25T13:03). Same systemic bug. NEW issue created (#aw_sccpr01). No PR trigger events (only schedule).
- **Metrics Collector**: 3 consecutive failures (runs #106-108). Metrics stale since 2026-03-25. NEW issue created (#aw_mc001). Root: agent writes wrong file path, push_repo_memory glob rejects it.

## P2 Warnings (NEW/Transient)
- **Smoke Codex** (#23431 open): Single schedule failure. OpenAI API cybersecurity restriction - transient/external. No action needed.
- **Smoke Gemini** (#23399 open): Single schedule failure (run #647). PR runs succeeding. Likely transient.
- **Lockfile Stats** (#23397 open): Single failure (run #210) after many successes. Likely transient.

## Systemic Bug: `push_repo_memory → Post Setup Scripts` failure
- Affects: PR Triage Agent, Smoke Update Cross-Repo PR, Smoke Create Cross-Repo PR
- Error: `Can't find 'action.yml' under '/home/runner/work/gh-aw/gh-aw/actions/setup'`
- After push_repo_memory checks out memory/* branch, actions/setup disappears
- Fix: Add `git checkout main` restore step in compiler_yaml.go push_repo_memory job
- Issues: #23151 (PR Triage - recovered), #23193 (Smoke Update), #aw_sccpr01 (Smoke Create)

## Recovered ✅
- **PR Triage Agent**: Run #301 succeeded (2026-03-29T06:21Z)
- **Daily Rendering Scripts Verifier**: 4 consecutive successes (runs #49-52)

## Actions Taken This Run
- Added recovery comment to #23151 (PR Triage Agent recovered)
- Added status comment to #23193 (Smoke Update Cross-Repo PR, schedule still failing)
- Created new issue #aw_mc001 (Metrics Collector - 3 consecutive failures)
- Created new issue #aw_sccpr01 (Smoke Create Cross-Repo PR - persistent schedule failures)

## Score Breakdown
- PR Triage Agent: recovered → +2
- Metrics Collector: 3rd consecutive failure → -1
- Net: 70 → 71 (↑1)

## Run Info
- Timestamp: 2026-03-29T12:00:00Z
- Run: §23708489882
- Score change: 70→71 (↑1)
