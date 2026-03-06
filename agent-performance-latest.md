# Agent Performance Analysis - 2026-03-06

**Run:** [§22774445782](https://github.com/github/gh-aw/actions/runs/22774445782)
**Status:** ⚠️ DEGRADED — OpenAI cybersec restriction EXPANDING (AI Moderator day 7+, Smoke Codex NEW), Lockdown token P0 ongoing

## Scores

- **Agent Quality:** 84/100 (↓1 from 85 — Smoke Codex NEW failure)
- **Agent Effectiveness:** 84/100 (↓1 from 85)
- **Critical Issues:** 7 P1 failures (3 infrastructure: 2 OpenAI cybersec + 4 lockdown token + 1 duplicate)
- **Total Runs (7-day):** 50 | Errors: 10 | Cost: $4.27 | Tokens: 20.3M

## Key Changes (Week over week: 3/1 → 3/6)

| Metric | Previous (3/1) | Current (3/6) | Trend |
|--------|---|---|---|
| Agent Quality | 85/100 | 84/100 | ↓ 1 |
| Agent Effectiveness | 85/100 | 84/100 | ↓ 1 |
| Workflow Health | 73/100 | 76/100 | ↑ 3 (Metrics recovered) |
| Executable Workflows | 162 | 165 | ↑ 3 new |
| P1 Failures | 3 | 7 | ⚠️ EXPANDED (4 new: Codex + tracking) |
| Changeset Generator cost | ~unknown | 10.4M tokens | 🔴 very high |
| OpenAI restriction scope | AI Moderator day 3 | AI Moderator day 7+ + Smoke Codex NEW | ❌ EXPANDING |

## Top Performers

1. **The Great Escapi (95/100):** 75K tokens, 4.1m — ultra-efficient, consistent pass
2. **Daily Safe Outputs Conformance Checker (93/100):** 164K tokens — clean
3. **Contribution Check (92/100):** 301K tokens — clean pass
4. **Smoke Claude/Copilot (90/100):** Smoke tests passing ✅ (Codex NEW failed)
5. **Agent Container Smoke Test (88/100):** 139K tokens, 1S/0F

## Critical Issues

1. ❌ **P0: OpenAI Cybersec Restriction (EXPANDING SCOPE)**
   - **AI Moderator:** day 7+ failure, issue #18922 OPEN (expires 2026-03-07 ⚠️ **3 DAYS**)
   - **Smoke Codex:** NEW failure (same OpenAI restriction) — run #2142
   - **Pattern:** Both codex-engine workflows now blocked; scope expanding
   - **Recommendation:** Urgent investigation; may require prompt modification

2. ❌ **P0: Lockdown Token Missing (GH_AW_GITHUB_TOKEN)**
   - **Issue Monster:** ~50+/day failures (1,100+ cumulative), issue #18919 (expires 2026-03-07 ⚠️)
   - **PR Triage Agent:** failures, issue #18952 (expires 2026-03-08 ⚠️)
   - **Daily Issues Report:** failures, NEW issue created
   - **Org Health Report:** weekly failures, no issue
   - **Status:** NO PROGRAMMATIC FIX PATH (#17414, #17807 both closed "not_planned")

3. ⚠️ **P1: Changeset Generator (HIGH COST)**
   - **Token usage:** 10.4M tokens in 1 run (HIGHEST in ecosystem)
   - **Cost:** ~$4.27/run
   - **Action:** Profile and optimize semantic queries

4. ⚠️ **P1: Chroma Issue Indexer (HIGH RESOURCE)**
   - **Token usage:** 3.3M tokens
   - **Firewall blocks:** 102 requests
   - **Action:** Investigate and optimize

## Actions Taken This Run

- ✅ Created comprehensive Agent Performance Report discussion
- ✅ Analyzed 165 workflows (97% healthy)
- ✅ Identified 7 P1 infrastructure failures (not agent quality)
- ✅ Recommend urgent OpenAI cybersec investigation
- ✅ Flagged expiring issues (#18922, #18919, #18952 all expire 3/7-3/8)

## Run Info

- Timestamp: 2026-03-06T17:31:03Z
- Workflow run: [§22774445782](https://github.com/github/gh-aw/actions/runs/22774445782)
- Health score: 84/100 (↓1 from 85)
- Report: Agent Performance Report discussion created
