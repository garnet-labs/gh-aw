# Workflow Health Dashboard - 2026-03-01

## Overview
- **Total workflows**: 162 executable (100% compiled ✅)
- **Healthy**: 157 (97%)
- **Failing (P1)**: 3 persistent lockdown workflows + 1 new regression
- **Compilation coverage**: 162/162 (100% ✅)
- **Outdated lock files**: 0 (13 same-commit timing artifacts — not truly stale ✅)
- **Overall health score**: 73/100 (↓ 5 from 78 — Metrics Collector regression)

## Status: DEGRADED — Lockdown Failures + New Metrics Collector Regression

### New This Week
- ⬆️ **4 new workflows added** (158 → 162) — all compiled successfully
- ❌ **Metrics Collector REGRESSION** — run #73 (2026-02-28) failed with ENOENT: /tmp/gh-aw/aw_info.json — new issue created

### Health Assessment Summary

- ✅ **0 compilation failures** (all 162 executable workflows compile)
- ✅ **100% compilation coverage** (no missing lock files)
- ✅ **0 truly outdated lock files**
- ❌ **P1: Lockdown token missing** — 3 workflows actively failing (ongoing 3+ weeks)
  - Issue Monster: failing every 30 min — run #2279 failed today — issue #18919 OPEN (expires 2026-03-07)
  - PR Triage Agent: failing every 6h — run #152 failed today — issue #18952 OPEN (expires 2026-03-08)
  - Daily Issues Report: failing daily — run #119 failed today — no active issue
  - Org Health Report: weekly — last scheduled run not visible
- ❌ **P2: Metrics Collector REGRESSION** — run #73 (2026-02-28) failed — new issue created
- ✅ **Smoke Copilot main**: passing (run #2180 success 2026-03-01)
- ✅ **Smoke Claude**: passing (run #2109 success 2026-03-01)

## Issues Tracked

- **#18919** [P1] Issue Monster failed — OPEN (expires 2026-03-07, run #22529058134)
- **#18952** [P1] PR Triage Agent failed — OPEN (expires 2026-03-08, run #22532514292)
- **NEW** [P2] Metrics Collector ENOENT failure — created this run
- **#17414** [Root Cause] GH_AW_GITHUB_TOKEN — CLOSED "not_planned"
- **#17807** Fix: remove lockdown:true — CLOSED "not_planned"

## Actions Taken This Run (2026-03-01)

- Created new issue for Metrics Collector regression
- Updated workflow-health-latest.md and shared-alerts.md
- Health score: 73/100 (↓ 5 from 78)

## Run Info
- Timestamp: 2026-03-01T07:23:00Z
- Workflow run: [§22538460268](https://github.com/github/gh-aw/actions/runs/22538460268)
- Health score: 73/100 (↓ 5 from 78)
