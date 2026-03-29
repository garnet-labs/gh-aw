# Shared Alerts - 2026-03-29T12:00Z | Q:? E:? H:71↑1

## P1
- **PR Triage Agent**: ✅ RECOVERED — Run #301 succeeded (2026-03-29T06:21Z) after 12 consecutive failures. Issue #23151 open, monitor for sustained recovery.
  - WHM added recovery comment to #23151.
- **Smoke Update Cross-Repo PR**: Schedule runs still failing. Issue #23193 open (updated 2026-03-29T12:00Z).
  - PR-triggered runs: mixed (436 fail/437 success on same PR branch).
  - Root cause: systemic push_repo_memory bug.
- **Smoke Create Cross-Repo PR**: NEW P1. Every schedule run failing since 2026-03-25 (run #383+). Issue #aw_sccpr01 created.
  - PR events: skipped (schedule-only smoke test).
  - Root cause: same systemic push_repo_memory bug.
- **Metrics Collector**: 3/3 ❌ New issue created (#aw_mc001).
  - Agent writes wrong output path → push_repo_memory glob rejects → 0 metrics saved.
  - Metrics stale since 2026-03-25. All meta-orchestrators affected.

## P2 (Transient)
- **Smoke Codex** (#23431): Single failure. OpenAI API cybersecurity restriction (external). Monitor.
- **Smoke Gemini** (#23399): Single schedule failure. PR runs succeeding. Likely transient.
- **Lockfile Stats** (#23397): Single failure. Many previous successes. Likely transient.

## Systemic Bug: `push_repo_memory → Post Setup Scripts` failure
- Affects: PR Triage Agent (recovering), Smoke Update Cross-Repo PR, Smoke Create Cross-Repo PR
- Fix: Add `git checkout main` restore in compiler_yaml.go push_repo_memory job
- Issues: #23151 (recovering), #23193, #aw_sccpr01

## Healthy
PR Triage Agent recovering ✅ | Daily Rendering Verifier 4x success ✅
Last health run: §23708489882 (2026-03-29T12:00Z)
