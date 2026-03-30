# Shared Alerts - 2026-03-30T12:00Z | Q:? E:? H:72↑1

## P1
- **Smoke Codex** (#23431, escalated P2→P1): ALL run types now failing (schedule + PR). OpenAI API access restriction broadened. Last success run #2538 (2026-03-28T01:09Z). Check API credentials/quota.
- **Smoke Update Cross-Repo PR** (#23193): Schedule runs still failing (#438, #442). PR runs succeeding. Systemic push_repo_memory bug.
- **Smoke Create Cross-Repo PR** (#23447): 8+ consecutive schedule failures since 2026-03-25. Same push_repo_memory bug.

## P2 (Transient/Monitoring)
- **Smoke Gemini** (#23399): Schedule #655 failed (2026-03-30T01:01Z). PR runs succeeding. Exit code 41. Monitor.
- **WHM Self**: Runs #282-#285 failed in safe_outputs job. Run #286 appears to be succeeding.

## Recovered ✅ (This Run)
- PR Triage Agent (#23151 closed): 5 consecutive successes
- Metrics Collector (#23446 closed): Run #109 succeeded
- Lockfile Stats (#23397 closed): Run #211 succeeded

## Systemic Bug: push_repo_memory → Post Setup Scripts
- Affects: Smoke Update Cross-Repo PR (#23193), Smoke Create Cross-Repo PR (#23447)
- Error: `Can't find 'action.yml' under '/home/runner/work/gh-aw/gh-aw/actions/setup'`
- After push_repo_memory checks out memory/* branch, actions/setup disappears
- Fix: Add `git checkout HEAD` restore step in compiler_yaml.go push_repo_memory job

## Systemic Issue: Codex API Access Restriction
- Affects: Smoke Codex (#23431)
- Error: "This user's access to this model has been temporarily restricted"
- Previously schedule-only, now ALL run types including PR

Last WHM run: §23743866195 (2026-03-30T12:00Z) — Score 72/100
