---
title: Observability
description: Export OpenTelemetry spans, view job summaries, and monitor workflow execution using gh-aw's built-in observability features.
---

gh-aw instruments every workflow run with OpenTelemetry traces and an optional job summary. You can export spans to any OTLP-compatible backend (Honeycomb, Grafana Tempo, Datadog, Sentry, and others) with a few lines of frontmatter configuration.

## Quick start

Add an `observability:` block to your workflow frontmatter:

```yaml
---
observability:
  otlp:
    endpoint: ${{ secrets.OTEL_ENDPOINT }}
    headers: ${{ secrets.OTEL_HEADERS }}
  job-summary: "on"
---
```

Store your collector URL and authentication headers as [encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) and reference them with GitHub Actions expressions.

> [!TIP]
> `job-summary: "on"` appends a compact observability section—including the trace ID—to the GitHub Actions job summary. This is useful even without a live collector.

## OTLP configuration

```yaml
observability:
  otlp:
    endpoint: https://api.honeycomb.io
    headers: "x-honeycomb-team=${{ secrets.HONEYCOMB_API_KEY }}"
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `endpoint` | string | Base URL of your OTLP/HTTP collector (e.g. `https://api.honeycomb.io`). Spans are posted to `{endpoint}/v1/traces`. Supports GitHub Actions expressions. |
| `headers` | string | Comma-separated `key=value` authentication headers injected as `OTEL_EXPORTER_OTLP_HEADERS`. Supports GitHub Actions expressions. |

### Environment variables injected

When `otlp.endpoint` is set, gh-aw injects these variables into every job in the generated workflow:

| Variable | Value |
|----------|-------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Value of `otlp.endpoint` |
| `OTEL_SERVICE_NAME` | `gh-aw` (fixed) |
| `OTEL_EXPORTER_OTLP_HEADERS` | Value of `otlp.headers` (when set) |

Any step or script running inside a gh-aw workflow can read these standard OpenTelemetry variables to emit its own spans or metrics.

### Firewall allowlist

When `otlp.endpoint` is a static URL (not a GitHub Actions expression), gh-aw automatically extracts the hostname and adds it to the [network allowlist](/gh-aw/reference/network/). This means you do not need to add a separate `network.allowed` entry for your collector:

```yaml
# ✅ Static URL — hostname added to firewall allowlist automatically
observability:
  otlp:
    endpoint: https://traces.example.com

# ⚠️ Expression — hostname cannot be resolved at compile time;
#    add the host to network.allowed manually if the AWF firewall is enabled
observability:
  otlp:
    endpoint: ${{ secrets.OTEL_ENDPOINT }}
```

## Job summary

```yaml
observability:
  job-summary: "on"
```

When enabled, a compact summary is appended to the GitHub Actions job summary after each run. The summary includes:

- Trace ID (for cross-referencing spans in your backend)
- Workflow name and engine
- Run URL

Set `job-summary: "off"` (or omit the field) to disable.

## Span reference

gh-aw emits two spans per job: a **setup span** at job start and a **conclusion span** at job end.

### Span names

| Span | Name pattern | Example |
|------|--------------|---------|
| Setup | `gh-aw.<job-name>.setup` | `gh-aw.agent.setup` |
| Conclusion | `gh-aw.<job-name>.conclusion` | `gh-aw.agent.conclusion` |

When no job name is configured the span name defaults to `gh-aw.job.setup` / `gh-aw.job.conclusion`.

### Setup span attributes

Emitted when the `actions/setup` step runs at the beginning of each job.

| Attribute | Type | Description |
|-----------|------|-------------|
| `gh-aw.job.name` | string | Job name as defined in the compiled workflow |
| `gh-aw.workflow.name` | string | Workflow name (from `GH_AW_INFO_WORKFLOW_NAME`) |
| `gh-aw.run.id` | string | GitHub Actions run ID |
| `gh-aw.run.attempt` | string | Run attempt number |
| `gh-aw.run.actor` | string | GitHub user or bot that triggered the run |
| `gh-aw.repository` | string | `owner/repo` string |
| `gh-aw.engine.id` | string | AI engine identifier (e.g. `copilot`, `claude`) — omitted when not set |

### Conclusion span attributes

Emitted by the post step at the end of each job. Includes all setup attributes plus:

| Attribute | Type | Description |
|-----------|------|-------------|
| `gh-aw.agent.conclusion` | string | Agent result: `success`, `failure`, `timed_out`, `cancelled`, or `skipped` |
| `gh-aw.model` | string | AI model used (e.g. `gpt-4.1`) — omitted when not set |
| `gh-aw.effective_tokens` | int | Total effective token count for the run — omitted when zero |
| `gh-aw.error.count` | int | Number of agent errors — included on failure |
| `gh-aw.error.messages` | string | Pipe-separated error messages (up to 5) — included on failure |
| `gh-aw.github.rate_limit.remaining` | int | GitHub API requests remaining at conclusion time |
| `gh-aw.github.rate_limit.limit` | int | Total GitHub API request quota |
| `gh-aw.github.rate_limit.used` | int | GitHub API requests consumed in the current window |
| `gh-aw.github.rate_limit.resource` | string | GitHub rate-limit resource category (e.g. `core`, `graphql`) |

### Resource attributes

Both span types include these resource-level attributes:

| Attribute | Description |
|-----------|-------------|
| `service.name` | Always `gh-aw` |
| `service.version` | gh-aw version string |
| `github.repository` | `owner/repo` string |
| `github.run_id` | GitHub Actions run ID |
| `github.actions.run_url` | Full URL to the workflow run |
| `github.event_name` | GitHub event that triggered the run (e.g. `push`, `issue_comment`) |

### Span status

The conclusion span status is set to `ERROR` when `gh-aw.agent.conclusion` is `failure` or `timed_out`. All other outcomes use status `OK`.

## Trace context and child workflows

All jobs within a single workflow run share **one trace ID**. The activation job generates the trace ID during its setup step and passes it to subsequent jobs via the `trace-id` step output.

When a workflow dispatches a child workflow using [`dispatch_repository`](/gh-aw/reference/safe-outputs/#repository-dispatch-dispatch_repository), the parent trace ID is propagated via the `aw_context` input. The child workflow's setup step reads `aw_context.otel_trace_id` and reuses the parent trace ID, so the entire operation—parent and all descendants—appears as a single trace in your backend.

The trace ID resolution priority for each job is:

1. `trace-id` action input (explicit, passed from activation job)
2. `INPUT_TRACE_ID` environment variable
3. `aw_info.context.otel_trace_id` (propagated from parent via `aw_context`)
4. Newly generated random trace ID

## OTLP JSONL artifact

Every span payload is also written to `/tmp/gh-aw/otel.jsonl` as a newline-delimited JSON file. This file is included in the gh-aw run artifact so you can inspect raw span data without a live collector—useful for debugging or offline analysis.

Each line in `otel.jsonl` is a complete OTLP/HTTP JSON traces payload and can be replayed to a collector later.

## Backend examples

### Honeycomb

```yaml
observability:
  otlp:
    endpoint: https://api.honeycomb.io
    headers: "x-honeycomb-team=${{ secrets.HONEYCOMB_API_KEY }},x-honeycomb-dataset=gh-aw"
```

### Grafana Tempo (via Grafana Cloud)

```yaml
observability:
  otlp:
    endpoint: https://tempo-prod-XX-prod-XX.grafana.net
    headers: "Authorization=Basic ${{ secrets.GRAFANA_CLOUD_TOKEN }}"
```

### Datadog

```yaml
observability:
  otlp:
    endpoint: https://trace.agent.datadoghq.com
    headers: "DD-API-KEY=${{ secrets.DD_API_KEY }}"
```

### Sentry

```yaml
observability:
  otlp:
    endpoint: https://o0.ingest.sentry.io/api/0
    headers: "x-sentry-auth=Sentry sentry_key=${{ secrets.SENTRY_DSN_KEY }}"
```

> [!NOTE]
> Endpoint URLs and header formats vary by backend version and region. Check your provider's OTLP/HTTP documentation for the correct values.

## Combined example

```yaml
---
name: my-workflow
engine: copilot
observability:
  otlp:
    endpoint: ${{ secrets.OTEL_ENDPOINT }}
    headers: ${{ secrets.OTEL_HEADERS }}
  job-summary: "on"
---

Your workflow prompt here.
```

> [!TIP]
> Store `OTEL_ENDPOINT` and `OTEL_HEADERS` as repository or organization secrets so the same values can be reused across all your workflows.
