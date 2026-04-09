---
"gh-aw": patch
---

Fix copilot engine execution so workflows with `features: copilot-requests: true` do not exclude `COPILOT_GITHUB_TOKEN` from the AWF container, while PAT-based tokens continue to be excluded.
