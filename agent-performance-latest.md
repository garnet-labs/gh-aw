# Agent Performance - 2026-04-04
Run: §23971272196 | Q:71↓1 E:68↑1 H:72→

Top: Workflow Health Manager (Q:92 E:89), Deep Report (Q:88 E:85), Plan Agent (Q:85 E:92), CLI Version Checker (Q:82 E:90)
Watch: Daily Issues Report (P1 11d, E:15), Go Logger Enhancement (crash 17.5m), Prompt Clustering (timeout 37m firewall), Duplicate Code Detector (Codex API restriction P1)
Systemic: ALL observed Claude runs resource_heavy_for_domain; avg 92% data-gathering (agentic_fraction avg 0.12); 19 stale lock files; Codex API restrictions

Failed: Daily Issues Report (11 consecutive), Duplicate Code Detector (7 consecutive, Codex blocked), Go Logger (crash), Prompt Clustering (timeout)
Active P1: #24266 (Daily Issues Report), #24284 (Duplicate Code Detector, Codex blocked)
Resolved P1: Daily Fact #24290 (closed, recompile fix)
New issues (Apr 1-4): 20+ total; 10 closed quickly (high plan/deep-report closure rate)

Recommendations:
- P1: Fix Daily Issues Report Generator (#24266)
- P1: Batch recompile 19 stale lock files (#24325)
- Systemic: Optimize Claude prompts (reduce data-gathering from 92% to <70%)
- P2: Investigate Go Logger crash, Prompt Clustering firewall issue

Stats: 184 total workflows (copilot:124, claude:41, codex:18, gemini:1). All 184 compiled. 35 active.
