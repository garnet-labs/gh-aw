# Workflow Health - 2026-03-30T12:00Z

Score: 72/100 (↑1 from 71). 178 workflows total.

## ✅ Recovered This Run
- **PR Triage Agent** (#23151 closed): 5 consecutive successes #301-305. Fully recovered.
- **Metrics Collector** (#23446 closed): Run #109 succeeded (2026-03-29T19:29Z) after 3 failures.
- **Lockfile Stats** (#23397 closed): Run #211 succeeded (2026-03-30T00:00Z). Transient.

## P1 Issues (Ongoing)
- **Smoke Codex** (#23431, updated → P1): ALL run types failing. 4 consecutive schedule + all PR runs. Last success: run #2538 (2026-03-28T01:09Z). Error: "access to this model temporarily restricted" — OpenAI API issue broadened to all contexts.
- **Smoke Update Cross-Repo PR** (#23193, updated): Schedule #438, #442 failed. PR runs succeeding. Systemic push_repo_memory git branch bug.
- **Smoke Create Cross-Repo PR** (#23447, updated): 8+ consecutive schedule failures since 2026-03-25. Same root cause.

## P2 Warnings
- **Smoke Gemini** (#23399 open): Schedule #655 failed (2026-03-30T01:01Z). PR runs succeeding. Exit code 41. Intermittent.
- **WHM Self**: Runs #282-#285 failed in safe_outputs job. Run #286 (current) expected to succeed.

## Systemic Bugs
1. **push_repo_memory → Post Setup Scripts** failure: Affects Smoke Update + Smoke Create cross-repo PR. Fix: `git checkout HEAD` in compiler_yaml.go push_repo_memory job. Issues: #23193, #23447.
2. **Codex API access**: Restriction broadened from schedule-only to all run types. Issue: #23431.

## Actions Taken This Run
- Closed #23151 (PR Triage recovered)
- Closed #23446 (Metrics Collector recovered)
- Closed #23397 (Lockfile Stats transient)
- Status comment on #23193 (Smoke Update still failing)
- Status comment on #23447 (Smoke Create still failing)
- Escalated #23431 Smoke Codex to P1 with comment
- Created WHM Dashboard issue (#aw_whm286)

## Run Info
- Timestamp: 2026-03-30T12:08:00Z
- Run: §23743866195
- Score: 71→72 (↑1)
