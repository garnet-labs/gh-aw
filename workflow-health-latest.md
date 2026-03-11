# Workflow Health - 2026-03-11T07:29Z

Score: 72/100 (↑2 from 70). 166 workflows, 166/166 compiled. 0 outdated locks.

## P1 Critical (Lockdown - Day 15+)
- Issue Monster: 100% failure (lockdown token) - #20315 OPEN
- PR Triage Agent: 100% failure (lockdown token) - #20315 OPEN
- Daily Issues Report: 100% failure (lockdown token) - #20315 OPEN
- Org Health Report: weekly failure (lockdown token) - no specific tracking issue

## P2 Warning
- Smoke Gemini: 100% schedule failure (add_comment context error) - no tracking issue
- Smoke Update Cross-Repo PR: 100% failure (pre-agent) - #20288 OPEN
- Safe Output Health Monitor: 2 consecutive failures - #20305 OPEN (updated this run)
- jsweep: intermittent (1/10) - no tracking issue

## Recoveries 🎉
- Smoke Codex: RECOVERED! Run #2215 Mar 11 succeeded (after 2 week OpenAI restriction) - #20285 still open
- Duplicate Code Detector: RECOVERED! Run #230 Mar 11 succeeded - #20304 still open

## Healthy
- Smoke Copilot ✅, Smoke Claude ✅, AI Moderator ✅ (mostly healthy)
- Metrics Collector ✅, Agentic Maintenance ✅

## Actions Taken This Run
- Created new dashboard issue #aw_dash11 (parent #19352)
- Added status update comment to #20305 (Safe Output Health Monitor)
- Smoke Codex and Duplicate Code Detector tracking issues #20285/#20304 can be closed

## Run Info
- Timestamp: 2026-03-11T07:29:00Z
- Run: §22941596501
