# Workflow Health - 2026-04-04T12:00Z

Score: 70/100 (↓2 from 72). 179 workflows total. Run: §23978397450

## 🆕 New Systemic: API Rate Limiting
Multiple workflows failing at pre_activation with "API rate limit exceeded for installation" around 05:00-05:40 UTC:
- Issue Monster (15% failure rate, 6/40 runs)
- Daily CLI Performance Agent (pre_activation rate limit)
- Agentic Maintenance (zizmor-scan rate limit)
Pattern: concurrent scheduling around 05:00-05:40 UTC hitting installation rate limit.
Recommendation: stagger schedules or add retry on rate limit.

## P1 Issues (Active)
- **Daily Issues Report Generator** (ongoing, 13+ days since Mar 24): Issue #24461 (open). Previous #24266 closed `not_planned` Apr 3. Still failing.
- **Duplicate Code Detector** (ongoing, Codex API restriction): Issue #24471 (open). Previous #24284 closed `not_planned` Apr 3. Externally blocked.

## Stale Lock Files (13) — ↓6 from 19
tidy, daily-security-red-team, agentic-observability-kit, layout-spec-maintainer, dev-hawk, firewall, prompt-clustering-analysis, gpclean, weekly-safe-outputs-spec-review, release, daily-cli-tools-tester, video-analyzer, daily-malicious-code-scan

## P2 (Team decided "not_planned")
- Smoke Update Cross-Repo PR, Smoke Create Cross-Repo PR, Smoke Codex, Smoke Gemini

## Intermittent (monitor)
- Workflow Normalizer: safe_outputs failure (artifact OK, processing error) §23966459696
- Auto-Triage Issues: safe_outputs failure (artifact OK) §23957755831
- Super Linter Report: EACCES permission error on artifact upload §23949152392
- Daily Observability Report: agent job failure §23966346682

## Actions Taken This Run
- Created WHM Dashboard #aw_whmDash04 (2026-04-04)
- Confirmed Daily Issues Report auto-issue #24461
- Confirmed Duplicate Code Detector auto-issue #24471
- Identified API rate limit systemic pattern

## Systemic Issues
1. **API rate limiting at 05:00-05:40 UTC**: Multiple workflows hit installation rate limit concurrently. Recommend schedule staggering.
2. **Codex API restrictions**: Duplicate Code Detector blocked. May affect others.
3. **Safe-outputs processing errors**: Workflow Normalizer + Auto-Triage had artifact OK but job failed.
4. **Stale lock files (13)**: Down from 19. Run `make recompile`.

## Run Info
- Timestamp: 2026-04-04T12:00Z
- Run: §23978397450
- Score: 72→70 (↓2)
