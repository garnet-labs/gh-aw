# Workflow Health Dashboard - 2026-03-07

## Overview
- **Total workflows**: 166 executable (stable from yesterday)
- **Healthy**: ~154 (93%)
- **Failing (P1)**: 6 workflows
- **Compilation coverage**: 166/166 (100% ✅)
- **Outdated lock files**: 12 ⚠️ NEW (md newer than lock — need `make recompile`)
- **Overall health score**: 74/100 (↓2 from 76 — outdated lock files)

## Status: DEGRADED — Lockdown Failures + OpenAI Restriction Day 10

### Critical Issues (P1)
- ❌ **Issue Monster** — still failing every 30min (run #2525, 2026-03-07T07:15Z) — issue #18919 ⚠️ **expires TODAY 9:09 PM UTC**
- ❌ **PR Triage Agent** — still failing (run #176, 2026-03-07T06:15Z) — issue #18952 (expires Mar 8)
- ❌ **Daily Issues Report** — still failing (run #125, 2026-03-07T01:58Z) — issue #18967 (expires Mar 8 2:01 AM)
- ❌ **Org Health Report** — still failing (last run #27, 2026-03-02) — NO tracking issue
- ⚠️ **AI Moderator** — intermittent (partially recovered), issue #18922 ⚠️ **expires TODAY 9:45 PM UTC**
- ❌ **Smoke Codex** — still failing (run #2169, 2026-03-07T00:51Z) — issues #18933, #19514 OPEN

### New Findings
- 12 workflows have outdated lock files (md newer than lock)
  - blog-auditor, cloclo, copilot-cli-deep-research, copilot-pr-prompt-analysis,
    daily-rendering-scripts-verifier, daily-team-evolution-insights, dev-hawk,
    pdf-summary, repository-quality-improver, smoke-temporary-id,
    static-analysis-report, typist

### Healthy
- ✅ Smoke Copilot: run #2272 success (2026-03-07T01:12Z)
- ✅ Smoke Claude: run #2196 success (2026-03-07T00:50Z)
- ✅ Metrics Collector: continuing recovery

## Issues Tracked
- **#18919** [P1] Issue Monster — OPEN ⚠️ expires TODAY Mar 7, 9:09 PM UTC
- **#18922** [P1] AI Moderator — OPEN ⚠️ expires TODAY Mar 7, 9:45 PM UTC (comment added this run)
- **#18952** [P1] PR Triage Agent — OPEN (expires Mar 8)
- **#18967** [P1] Daily Issues Report — OPEN (expires Mar 8, 2:01 AM)
- **#18933** [P1] Smoke Codex — OPEN (pre-agent)
- **#19514** [P1] Smoke Codex — OPEN (pre-agent)
- **#19634** Smoke Codex detailed — CLOSED "not_planned" (2026-03-06)
- **aw_Dash07** New Dashboard — created this run (2026-03-07)
- **#19814** Previous Dashboard — expired

## Actions This Run (2026-03-07T07:20Z)
- Created new dashboard issue (aw_Dash07) replacing #19814 which expired
- Added Day 10 status comment to #18922 (AI Moderator) with partial recovery details
- Updated workflow-health-latest.md and shared-alerts.md
- Health score: 74/100 (↓2 from 76)

## Run Info
- Timestamp: 2026-03-07T07:20:00Z
- Workflow run: [§22794578625](https://github.com/github/gh-aw/actions/runs/22794578625)
- Health score: 74/100 (↓2 from 76)
