---
"gh-aw": patch
---

Add BYOK (Bring Your Own Key) support for Copilot CLI 1.0.19: when `COPILOT_PROVIDER_BASE_URL` is set in `engine.env`, the provider hostname is automatically added to the firewall allow-list so the Copilot CLI can reach the custom model provider.
