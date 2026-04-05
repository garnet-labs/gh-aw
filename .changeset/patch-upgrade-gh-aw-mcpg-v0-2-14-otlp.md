---
"gh-aw": patch
---

Update MCP Gateway (`gh-aw-mcpg`) from `v0.2.12` to `v0.2.14` and add OpenTelemetry OTLP tracing support per spec §4.1.3.6 (v1.11.0).

**Version bump (v0.2.12 → v0.2.14)**

- `v0.2.13`: OpenTelemetry OTLP trace export, configurable session timeout, stricter auth validation, security hardening
- `v0.2.14`: OpenTelemetry OTLP tracing per spec §4.1.3.6 (v1.11.0), extended default session timeout to 6 hours

**New: OpenTelemetry OTLP tracing configuration**

The `sandbox.mcp` frontmatter section now supports an optional `opentelemetry` object to configure distributed tracing of MCP calls through the gateway. When configured, the gateway emits OTLP/HTTP spans for every MCP tool invocation.

```yaml
sandbox:
  mcp:
    opentelemetry:
      endpoint: "https://collector.example.com:4318/v1/traces"
      headers:
        Authorization: "Bearer ${{ secrets.OTEL_TOKEN }}"
      traceId: "${{ vars.PARENT_TRACE_ID }}"
      spanId: "${{ vars.PARENT_SPAN_ID }}"
      serviceName: "my-workflow-gateway"
```

- `endpoint` (required): HTTPS OTLP/HTTP collector URL. Static URLs are automatically added to the network firewall allowlist.
- `headers` (optional): HTTP headers for every export request (e.g., `Authorization`).
- `traceId` (optional): 32-char lowercase hex W3C parent trace ID for context propagation.
- `spanId` (optional): 16-char lowercase hex W3C parent span ID (requires `traceId`).
- `serviceName` (optional): Service name in traces (default: `"mcp-gateway"`).
