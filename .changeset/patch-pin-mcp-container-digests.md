---
"gh-aw": patch
---

Pin default MCP container images to immutable SHA-256 digests in compiled workflows, while keeping gateway config container fields tag-based for schema compatibility.

Store container digest pins in the `containers` section of `.github/aw/actions-lock.json` and refresh them during `gh aw update` and `gh aw upgrade`.
