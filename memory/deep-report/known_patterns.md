## Known Patterns (2026-03-18)
- Weekly issue throughput is high and net-positive for closure (439 closed vs 61 open in the weekly slice), with only 3 unlabeled open issues remaining.
- Recent discussions are heavily audit-driven (32/42 recent discussions in `audits`), indicating strong observability cadence.
- Failure concentration persists in a small workflow set; `Issue Monster` failed twice in the latest 15-run sample, while most other failures are singletons.
- Token usage remains concentrated in a few workflows; `Daily Security Red Team Agent` and `Daily CLI Performance Agent` dominate measured token volume.
- Firewall blocks are still present in sampled runs (14 blocked requests), mostly against disallowed `github.com`/`ab.chatgpt.com` domains.
