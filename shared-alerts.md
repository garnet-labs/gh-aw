# Shared Alerts - 2026-03-25T12:03Z | Q:82 E:75 H:73↑1

## P1
- Smoke Update Cross-Repo PR: 0/2+ ❌ issue #21797 open (auto-gen, expires Mar 26). 6+ day outage.
  - Run #375 failed 2026-03-25T00:58. Error: missing smoke-test label OR git exit 128 on pr-branch fetch.
  - Issue #22523 manually closed by pelikhan Mar 24.

## P2
- Smoke Claude: alternating failure/success ⚠️ (2/8 schedule failures, both overnight)
- Daily Rendering Scripts Verifier: run #48 failed (Mar 25) - threat detection infra issue, not workflow logic
- 16 stale lock files (down from 20 - slowly improving)

## Recovered ✅
- PR Triage Agent: 8/8 consecutive ✅ SOLID
- Issue Triage Agent: 3/3 consecutive FULLY RECOVERED
- Daily Rendering Verifier: SOLIDIFIED (4+ consecutive, distinct from Daily Rendering Scripts Verifier)
- Smoke Gemini: solid
- Smoke Copilot: 8/8 ✅ (fully solid)
- Smoke Codex: 6/6 ✅ (solid)
- Issue Monster: 1 transient failure (Mar 25) surrounded by 8+ successes

## Healthy
Metrics Collector 100% | PR Triage Agent 100% | Auto-Triage Issues mostly ✅
Last health run: §23539975667 (2026-03-25T12:03Z)
