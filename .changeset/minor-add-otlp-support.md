---
"gh-aw": minor
---

Add OTLP trace export support via `observability.otlp` frontmatter config. Every job in the compiled workflow now emits a `gh-aw.job.setup` span at start and a conclusion span at end. A single trace ID is threaded across all jobs (activation, agent, detection, safe-outputs, cache, repo-memory, publish-assets, unlock, notify-comment, QMD) for end-to-end correlation in any OTLP-compatible backend (Langfuse, Datadog, Honeycomb, Grafana Tempo, etc.).

When a static OTLP endpoint URL is configured, its hostname is automatically added to the AWF firewall allowlist so outbound traces are not blocked. Requires gh-aw-firewall ≥ v0.25.13 (which includes the Squid domain-injection security fix to ensure user-provided domain patterns are safely handled).

**Usage:**
```yaml
observability:
  otlp:
    endpoint: ${{ secrets.GH_AW_OTEL_ENDPOINT }}   # or a static URL
    headers: ${{ secrets.GH_AW_OTEL_HEADERS }}      # optional
```

The `OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_SERVICE_NAME=gh-aw` environment variables are injected into every step. When `headers` is set, `OTEL_EXPORTER_OTLP_HEADERS` is also injected. Trace propagation to child workflows dispatched via `dispatch_workflow` is handled automatically via `aw_context`.
