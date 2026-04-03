# Agent Performance - 2026-04-03
Run: §23933904588 | Q:72↓3 E:67↓6 H:75→

Top: Daily Safe Outputs Conformance Checker, Lockfile Statistics Analysis, Smoke Claude (Apr3)
Watch: Schema Consistency Checker (model_downgrade 4/5), Daily Documentation Updater (model_downgrade, poor_ctrl)
Systemic: ALL 15 runs resource_heavy_for_domain; avg 92% data-gathering (agentic_fraction avg 0.12)

Failed: Go Logger Enhancement (agent crash 17.5m), Copilot Agent Prompt Clustering Analysis (timeout 37m, EACCES firewall/audit perm), Smoke Claude (safe_outputs fail, 100% network block rate)

P1 tracked: Smoke Claude MCP timeout #23528 #23067 (2/3 runs fail this week)
P1 tracked: Smoke Multi PR safe_outputs schedule (WHM created issue)
Watch NEW: Go Logger Enhancement — failure cause unclear; agent ran 54 tool types in 17.5m then crashed. Needs investigation.
Watch NEW: Copilot Agent Prompt Clustering Analysis — /tmp/gh-aw/sandbox/firewall/audit permission denied causing 37min timeout. 

Stats: 15 claude runs (2d). $14.44 total. Avg 43.4 turns. 11 success / 3 fail / 1 cancelled.
Model downgrade candidates: Schema Consistency Checker, Sergo, Daily Documentation Updater
