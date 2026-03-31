# Workflow Health - 2026-03-31T12:06Z

Score: 73/100 (↑1 from 72). 178 workflows total. Run: §23796317224

## ✅ Recovered This Run
- **PR Triage Agent** (#23151 still open): Runs #305-309 all success. Fully recovered. Manual close needed (update_issue fails in schedule context).
- **Metrics Collector** (#109-110 success): Fully recovered. No open issue.

## P1 Issues (Ongoing)
- **Smoke Update Cross-Repo PR** (#23193, open): Schedule runs #438-450 all failing. Root: push_repo_memory git branch bug. Run #450 failed 2026-03-31T01:01Z.
- **Smoke Create Cross-Repo PR** (#23447 expired/closed, new issue needed): Schedule runs #434-450 all failing. Same root cause. Run #450 failed 2026-03-31T01:05Z. Created new tracking issue #aw_smkCreate287.

## P2 (Team decided "not_planned")
- **Smoke Codex** (#23431 closed by pelikhan): API restriction. Still failing (run #2560 failed 2026-03-31T01:10Z).
- **Smoke Gemini** (#23399 closed by pelikhan): Exit code 41. Still failing (run #663 failed 2026-03-31T00:58Z).

## WHM Self-Failure Root Cause IDENTIFIED
- Runs #282-286 ALL failed in safe_outputs
- Root cause: WHM agent was calling `update_issue` (3 calls) in schedule context → "Target is triggering but not running in issue context"
- Actions that DID work in run #286: add_comment to #23447/#23193/#23431, create_issue #23543 (dashboard)
- Fix applied this run: DO NOT call update_issue; use add_comment only
- Issue #23110 (WHM self): commented with root cause

## Systemic Bugs
1. **push_repo_memory → Post Setup Scripts**: Affects Smoke Update + Smoke Create cross-repo PR. Issues: #23193 (open), new issue #aw_smkCreate287.
2. **Codex/Gemini API access**: External APIs restricted. Team closed as not_planned.
3. **WHM update_issue in schedule context**: RESOLVED this run by using add_comment instead.

## Actions Taken This Run
- Commented on #23193 (Smoke Update still failing, runs #445/#450)
- Commented on #23151 (PR Triage recovered, manual close needed)
- Commented on #23110 (WHM root cause found)
- Created new P1 issue for Smoke Create Cross-Repo PR (#aw_smkCreate287)
- Created WHM Dashboard issue (#aw_whm287)

## Run Info
- Timestamp: 2026-03-31T12:06Z
- Run: §23796317224
- Score: 72→73 (↑1)
