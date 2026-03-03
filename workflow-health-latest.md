# Workflow Health Dashboard - 2026-03-03

## Overview
- **Total workflows**: 165 executable (+3 from 162, 100% compiled ✅)
- **Healthy**: ~160 (97%)
- **Failing (P1)**: 5 workflows
- **Compilation coverage**: 165/165 (100% ✅)
- **Outdated lock files**: 0 (✅ all current)
- **Overall health score**: 76/100 (↑3 from 73 — Metrics Collector recovered)

## Status: DEGRADED — Lockdown Failures + AI Moderator Day 5

### New This Week
- ⬆️ **3 new workflows added** (162 → 165) — all compiled successfully
- ✅ **Metrics Collector RECOVERED** — run #75 succeeded (2026-03-02T18:22Z)
- ❌ **AI Moderator now on DAY 5** — OpenAI cybersec restriction continues

### Health Assessment Summary

- ✅ **0 compilation failures** (all 165 executable workflows compile)
- ✅ **100% compilation coverage** (no missing lock files)
- ✅ **0 truly outdated lock files**
- ✅ **Metrics Collector**: RECOVERED (run #75 success) — up from P2 regression
- ❌ **P1: Lockdown token missing** — 4 workflows actively failing
  - Issue Monster: run #2362 failed today — issue #18919 OPEN (expires 2026-03-07 ⚠️)
  - PR Triage Agent: run #160 failed today — issue #18952 OPEN (expires 2026-03-08)
  - Daily Issues Report: run #121 failed today — NEW issue created this run
  - Org Health Report: run #27 failed (weekly, 2026-03-02) — no active issue
- ❌ **P1: AI Moderator** — day 5 failure (OpenAI cybersec restriction on gpt-5.3-codex)
  - Issue #18922 OPEN (38 comments, expires 2026-03-07 ⚠️)
  - Updated automatically today (2026-03-03T05:54Z)
- ✅ **Smoke Copilot/Claude**: both passing today

## Issues Tracked

- **#18919** [P1] Issue Monster failed — OPEN (expires 2026-03-07, run #22529058134) ⚠️ EXPIRING SOON
- **#18952** [P1] PR Triage Agent failed — OPEN (expires 2026-03-08, run #22532514292)
- **#18922** [P1] AI Moderator failed — OPEN (38 comments, expires 2026-03-07) ⚠️ EXPIRING SOON
- **NEW** [P1] Daily Issues Report — created this run (aw_DirP1)
- Dashboard issue created: aw_Dash03
- **#17414** Root Cause: GH_AW_GITHUB_TOKEN — CLOSED "not_planned"
- **#17807** Fix: remove lockdown:true — CLOSED "not_planned"

## Actions Taken This Run (2026-03-03)

- Created tracking issue for Daily Issues Report P1 lockdown failures
- Created Workflow Health Dashboard issue (2026-03-03)
- Updated workflow-health-latest.md and shared-alerts.md
- Health score: 76/100 (↑3 from 73 — Metrics Collector recovered)

## Run Info
- Timestamp: 2026-03-03T07:28:00Z
- Workflow run: [§22612773467](https://github.com/github/gh-aw/actions/runs/22612773467)
- Health score: 76/100 (↑3 from 73)

## Upcoming Expirations ⚠️
- #18919 (Issue Monster) expires 2026-03-07 — 4 days
- #18922 (AI Moderator) expires 2026-03-07 — 4 days
