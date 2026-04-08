# Workflow Health - 2026-04-08T12:07Z

Score: 71/100 (↓2 from 73). 182 workflows. Run: §24134411505

## KEY FINDING: Systemic Failure Spike (P1)

20 new failure issues created Apr 8. Common pattern: engine exits code 1 after containers stop cleanly. Affects 12 Copilot + 1 Claude workflows.

## P1 Issues (Active)

- **AI Moderator** (#25022): missing_data every run. Assigned to Copilot via Issue Monster. Open.
- **Systemic Engine Failures Apr 8** (new issue aw_sys001 created): 13+ workflows, "exit code 1", spans 01:02-12:04 UTC. Possible causes: infra issue, firewall v0.25.16, Copilot CLI 1.0.21, pre-steps feature.

## Resolved Since Apr 7 ✅

- #24718 Duplicate Code Detector: CLOSED not_planned (Apr 6)
- #24829 GitHub Remote MCP Auth: CLOSED not_planned (Apr 7)

## Score Breakdown

- Compilation: 182/182 lock files, 0 stale: +35
- P1 issues (AI Moderator + systemic): -12
- Resolved P1s: +10 (baked into 73 → adjusted)
- Intermittent + smoke failures: -5
- Net: 71/100

## Score Trend

68 → 71 → 73 → 71 (Apr 5–8, spike today)

## Next Run Priorities

1. Check if AI Moderator Copilot PR resolved #25022
2. Track if systemic engine failure issue is resolved/acknowledged
3. Monitor pre-steps feature adoption and lock file drift
4. Check Copilot CLI 1.0.21 for known issues
