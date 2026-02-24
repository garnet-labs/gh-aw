# Workflow Health Dashboard - 2026-02-24

## Overview
- **Total workflows**: 158 executable (100% compiled ✅)
- **Healthy**: 154 (97%)
- **Failing (P1)**: 4 workflows (3%) — lockdown token failures (now 2 weeks streak)
- **Critical**: 0 (0%)
- **Compilation coverage**: 158/158 (100% ✅)
- **Outdated lock files**: 0 (all up-to-date ✅)
- **Overall health score**: 80/100 (↓ 2 from 82 — 4th lockdown workflow confirmed)

## Status: DEGRADED — P1 Lockdown Failures Growing

The lockdown token issue continues unresolved. Org Health Report confirmed as 4th failing workflow (2 consecutive weekly failures).

### Health Assessment Summary

- ✅ **0 compilation failures** (all 158 executable workflows compile)
- ✅ **100% compilation coverage** (no missing lock files)
- ✅ **0 outdated lock files**
- ❌ **P1: Lockdown token missing** — 4 workflows failing (≥2 week streak)
  - Issue Monster: ~50+ failures/day (every 30 min)
  - PR Triage Agent: failing (every 6h)
  - Daily Issues Report: failing (daily)
  - **NEW**: Org Health Report: 2 consecutive weekly failures (#22 Feb 16, #23 Feb 23)
- ✅ **All smoke tests on main**: Smoke Copilot, Claude, Codex, Gemini passing on main
- ✅ **PR #18079 branch**: Smoke Claude/Copilot/Gemini failing on `merged_detection_job` branch — EXPECTED (WIP PR testing detection job merge)
- ✅ **Metrics Collector**: 8/8 recent runs success
- ✅ **13 total workflows have `lockdown: true`** — 4 confirmed failing

## Root Cause: Lockdown Mode + Missing GH_AW_GITHUB_TOKEN

13 workflows use `lockdown: true`:
daily-issues-report, discussion-task-miner, grumpy-reviewer, issue-arborist,
issue-monster, issue-triage-agent, org-health-report, pr-triage-agent,
refiner, stale-repo-identifier, weekly-issue-summary, weekly-safe-outputs-spec-review,
workflow-generator

Currently failing (high frequency):
- issue-monster (schedule: every 30min)
- pr-triage-agent (schedule: every 6h)
- daily-issues-report (schedule: daily)
- org-health-report (schedule: weekly Monday ~09:00)

## Issues Tracked

- **#17387** [P1] Issue Monster failed — OPEN (30+ comments, still failing)
- **#16801** [P1] PR Triage Agent failed — OPEN
- **#17864** [P1] Org Health Report failed — OPEN (same lockdown root cause)
- **#17414** [Root Cause] GH_AW_GITHUB_TOKEN — CLOSED "not_planned" (2026-02-22)
- **#17807** Fix: remove lockdown:true — OPEN (patch ready)
- **#17408** No-Op Runs — OPEN (normal behavior)

## Actions Taken This Run (2026-02-24)

- Added comment to #17387 with updated status (4th workflow now failing)
- Updated workflow-health-latest.md and shared-alerts.md
- Health score: 80/100 (↓ 2 from 82)

## Run Info
- Timestamp: 2026-02-24T07:32:00Z
- Workflow run: [§22341024382](https://github.com/github/gh-aw/actions/runs/22341024382)
- Health score: 80/100 (↓ 2 from yesterday's 82)
