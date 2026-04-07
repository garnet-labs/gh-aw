---
title: Bring Your Own Key (BYOK)
description: Use a custom model provider with the Copilot engine — including Ollama, vLLM, Azure OpenAI, and Anthropic endpoints — via BYOK configuration.
sidebar:
  order: 605
---

BYOK (Bring Your Own Key) lets you route Copilot CLI inference through your own model provider instead of GitHub's default model routing. This is useful for local testing with Ollama or vLLM, using Azure OpenAI endpoints, or integrating a custom Anthropic deployment.

BYOK is a Copilot CLI feature and only applies to the `copilot` engine.

## How BYOK works

Setting `COPILOT_PROVIDER_BASE_URL` in `engine.env` activates BYOK mode. The Copilot CLI then uses the specified endpoint for all model inference, bypassing GitHub's model routing. Authentication is handled via `COPILOT_PROVIDER_API_KEY` or `COPILOT_PROVIDER_BEARER_TOKEN`.

When BYOK is active, `COPILOT_GITHUB_TOKEN` is still required for GitHub API operations but is not used for model inference.

## BYOK Environment Variables

| Variable | Description |
|----------|-------------|
| `COPILOT_PROVIDER_BASE_URL` | API endpoint for the BYOK provider. Setting this variable activates BYOK mode. |
| `COPILOT_PROVIDER_TYPE` | Provider protocol: `"openai"` (default), `"azure"`, or `"anthropic"`. |
| `COPILOT_PROVIDER_API_KEY` | API key for the BYOK provider. |
| `COPILOT_PROVIDER_BEARER_TOKEN` | Bearer token for the BYOK provider. Takes precedence over `COPILOT_PROVIDER_API_KEY` when both are set. |
| `COPILOT_PROVIDER_WIRE_API` | API wire format: `"completions"` (default) or `"responses"` (required for GPT-5 series models). |
| `COPILOT_PROVIDER_AZURE_API_VERSION` | Azure API version. Default: `"2024-10-21"`. Only used when `COPILOT_PROVIDER_TYPE=azure`. |
| `COPILOT_PROVIDER_MODEL_LIMITS_ID` | Override the model name used for token limit catalog lookup. Useful when the BYOK model name differs from Copilot's built-in model catalog. |
| `COPILOT_PROVIDER_MAX_PROMPT_TOKENS` | Maximum prompt tokens for the BYOK model. Overrides the catalog value. |
| `COPILOT_PROVIDER_MAX_OUTPUT_TOKENS` | Maximum output tokens for the BYOK model. Overrides the catalog value. |

## Examples

### Ollama (local testing)

[Ollama](https://ollama.com/) serves models locally with an OpenAI-compatible API. Use it for development and testing without requiring GitHub authentication for model inference.

```aw wrap
engine:
  id: copilot
  model: llama3.2
  env:
    COPILOT_PROVIDER_BASE_URL: "http://localhost:11434/v1"
    COPILOT_PROVIDER_TYPE: "openai"
    COPILOT_PROVIDER_API_KEY: "ollama"  # Ollama accepts any non-empty string

network:
  allowed:
    - defaults
    - localhost
```

> [!NOTE]
> Ollama must be running locally (`ollama serve`) before the workflow job starts. For CI runs, start Ollama in a service container or pre-step.

### vLLM (self-hosted OpenAI-compatible server)

[vLLM](https://github.com/vllm-project/vllm) is an OpenAI-compatible inference server for self-hosted models:

```aw wrap
engine:
  id: copilot
  model: mistral-7b-instruct
  env:
    COPILOT_PROVIDER_BASE_URL: "https://vllm.internal.example.com/v1"
    COPILOT_PROVIDER_TYPE: "openai"
    COPILOT_PROVIDER_API_KEY: ${{ secrets.VLLM_API_KEY }}

network:
  allowed:
    - defaults
    - vllm.internal.example.com
```

### Azure OpenAI

For Azure OpenAI deployments, set `COPILOT_PROVIDER_TYPE=azure` and use your Azure endpoint URL:

```aw wrap
engine:
  id: copilot
  model: gpt-4o
  env:
    COPILOT_PROVIDER_BASE_URL: "https://my-resource.openai.azure.com/openai/deployments/gpt-4o"
    COPILOT_PROVIDER_TYPE: "azure"
    COPILOT_PROVIDER_API_KEY: ${{ secrets.AZURE_OPENAI_API_KEY }}
    COPILOT_PROVIDER_AZURE_API_VERSION: "2024-10-21"

network:
  allowed:
    - defaults
    - my-resource.openai.azure.com
```

### Anthropic-compatible endpoint

For a custom Anthropic-compatible endpoint (e.g., a proxy or private deployment):

```aw wrap
engine:
  id: copilot
  model: claude-sonnet-4.5
  env:
    COPILOT_PROVIDER_BASE_URL: "https://anthropic-proxy.corp.example.com"
    COPILOT_PROVIDER_TYPE: "anthropic"
    COPILOT_PROVIDER_API_KEY: ${{ secrets.PROXY_API_KEY }}

network:
  allowed:
    - defaults
    - anthropic-proxy.corp.example.com
```

## Offline mode

Set `COPILOT_OFFLINE=true` to disable all network access from the Copilot CLI. This requires a local BYOK provider (such as Ollama) because the Copilot CLI cannot reach GitHub's model routing endpoints.

```aw wrap
engine:
  id: copilot
  model: llama3.2
  env:
    COPILOT_OFFLINE: "true"
    COPILOT_PROVIDER_BASE_URL: "http://localhost:11434/v1"
    COPILOT_PROVIDER_TYPE: "openai"
    COPILOT_PROVIDER_API_KEY: "ollama"
```

> [!WARNING]
> Offline mode is intended for air-gapped or local testing scenarios. The Copilot CLI cannot access GitHub APIs or tools that require network connectivity when `COPILOT_OFFLINE=true` is set.

## Token limit overrides

When using a BYOK model that Copilot CLI does not recognize from its built-in catalog, set `COPILOT_PROVIDER_MODEL_LIMITS_ID` to a known model name to use its token limits, or set explicit limits with `COPILOT_PROVIDER_MAX_PROMPT_TOKENS` and `COPILOT_PROVIDER_MAX_OUTPUT_TOKENS`:

```aw wrap
engine:
  id: copilot
  model: my-custom-model
  env:
    COPILOT_PROVIDER_BASE_URL: "https://my-llm.internal.example.com/v1"
    COPILOT_PROVIDER_API_KEY: ${{ secrets.LLM_API_KEY }}
    COPILOT_PROVIDER_MODEL_LIMITS_ID: "gpt-4o"  # use gpt-4o token limits
    # Or set explicit limits:
    # COPILOT_PROVIDER_MAX_PROMPT_TOKENS: "128000"
    # COPILOT_PROVIDER_MAX_OUTPUT_TOKENS: "4096"
```

## Related Documentation

- [AI Engines](/gh-aw/reference/engines/) - Engine configuration and agentic flags
- [Environment Variables](/gh-aw/reference/environment-variables/) - Copilot CLI environment variable reference
- [Network](/gh-aw/reference/network/) - Configuring outbound network access for custom endpoints
