//go:build !integration

package workflow

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestExtractAPITargetHost tests the extractAPITargetHost function that extracts
// hostnames from custom API base URLs in engine.env
func TestExtractAPITargetHost(t *testing.T) {
	tests := []struct {
		name         string
		workflowData *WorkflowData
		envVar       string
		expected     string
	}{
		{
			name: "extracts hostname from HTTPS URL with path",
			workflowData: &WorkflowData{
				EngineConfig: &EngineConfig{
					Env: map[string]string{
						"OPENAI_BASE_URL": "https://llm-router.internal.example.com/v1",
					},
				},
			},
			envVar:   "OPENAI_BASE_URL",
			expected: "llm-router.internal.example.com",
		},
		{
			name: "extracts hostname from HTTP URL with port and path",
			workflowData: &WorkflowData{
				EngineConfig: &EngineConfig{
					Env: map[string]string{
						"ANTHROPIC_BASE_URL": "http://localhost:8080/v1",
					},
				},
			},
			envVar:   "ANTHROPIC_BASE_URL",
			expected: "localhost:8080",
		},
		{
			name: "handles hostname without protocol or path",
			workflowData: &WorkflowData{
				EngineConfig: &EngineConfig{
					Env: map[string]string{
						"OPENAI_BASE_URL": "api.openai.com",
					},
				},
			},
			envVar:   "OPENAI_BASE_URL",
			expected: "api.openai.com",
		},
		{
			name: "handles hostname with port but no protocol",
			workflowData: &WorkflowData{
				EngineConfig: &EngineConfig{
					Env: map[string]string{
						"OPENAI_BASE_URL": "localhost:8000",
					},
				},
			},
			envVar:   "OPENAI_BASE_URL",
			expected: "localhost:8000",
		},
		{
			name: "returns empty string when env var not set",
			workflowData: &WorkflowData{
				EngineConfig: &EngineConfig{
					Env: map[string]string{
						"OTHER_VAR": "value",
					},
				},
			},
			envVar:   "OPENAI_BASE_URL",
			expected: "",
		},
		{
			name: "returns empty string when engine config is nil",
			workflowData: &WorkflowData{
				EngineConfig: nil,
			},
			envVar:   "OPENAI_BASE_URL",
			expected: "",
		},
		{
			name:         "returns empty string when workflow data is nil",
			workflowData: nil,
			envVar:       "OPENAI_BASE_URL",
			expected:     "",
		},
		{
			name: "returns empty string for empty URL",
			workflowData: &WorkflowData{
				EngineConfig: &EngineConfig{
					Env: map[string]string{
						"OPENAI_BASE_URL": "",
					},
				},
			},
			envVar:   "OPENAI_BASE_URL",
			expected: "",
		},
		{
			name: "extracts Azure OpenAI endpoint hostname",
			workflowData: &WorkflowData{
				EngineConfig: &EngineConfig{
					Env: map[string]string{
						"OPENAI_BASE_URL": "https://my-resource.openai.azure.com/openai/deployments/gpt-4",
					},
				},
			},
			envVar:   "OPENAI_BASE_URL",
			expected: "my-resource.openai.azure.com",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := extractAPITargetHost(tt.workflowData, tt.envVar)
			assert.Equal(t, tt.expected, result, "Extracted hostname should match expected value")
		})
	}
}

// TestAWFCustomAPITargetFlags tests that BuildAWFArgs includes custom API target flags
// when OPENAI_BASE_URL or ANTHROPIC_BASE_URL are configured in engine.env
func TestAWFCustomAPITargetFlags(t *testing.T) {
	t.Run("includes openai-api-target flag when OPENAI_BASE_URL is configured", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "codex",
				Env: map[string]string{
					"OPENAI_BASE_URL": "https://llm-router.internal.example.com/v1",
					"OPENAI_API_KEY":  "${{ secrets.LLM_ROUTER_KEY }}",
				},
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{
					Enabled: true,
				},
			},
		}

		config := AWFCommandConfig{
			EngineName:     "codex",
			WorkflowData:   workflowData,
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.Contains(t, argsStr, "--openai-api-target", "Should include --openai-api-target flag")
		assert.Contains(t, argsStr, "llm-router.internal.example.com", "Should include custom hostname")
	})

	t.Run("includes anthropic-api-target flag when ANTHROPIC_BASE_URL is configured", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "claude",
				Env: map[string]string{
					"ANTHROPIC_BASE_URL": "https://claude-proxy.internal.company.com",
					"ANTHROPIC_API_KEY":  "${{ secrets.CLAUDE_PROXY_KEY }}",
				},
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{
					Enabled: true,
				},
			},
		}

		config := AWFCommandConfig{
			EngineName:     "claude",
			WorkflowData:   workflowData,
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.Contains(t, argsStr, "--anthropic-api-target", "Should include --anthropic-api-target flag")
		assert.Contains(t, argsStr, "claude-proxy.internal.company.com", "Should include custom hostname")
	})

	t.Run("does not include api-target flags when using default URLs", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "codex",
				// No custom OPENAI_BASE_URL
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{
					Enabled: true,
				},
			},
		}

		config := AWFCommandConfig{
			EngineName:     "codex",
			WorkflowData:   workflowData,
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.NotContains(t, argsStr, "--openai-api-target", "Should not include --openai-api-target when not configured")
		assert.NotContains(t, argsStr, "--anthropic-api-target", "Should not include --anthropic-api-target when not configured")
	})

	t.Run("includes both api-target flags when both are configured", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "custom",
				Env: map[string]string{
					"OPENAI_BASE_URL":    "https://openai-proxy.company.com/v1",
					"ANTHROPIC_BASE_URL": "https://anthropic-proxy.company.com",
				},
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{
					Enabled: true,
				},
			},
		}

		config := AWFCommandConfig{
			EngineName:     "custom",
			WorkflowData:   workflowData,
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.Contains(t, argsStr, "--openai-api-target", "Should include --openai-api-target flag")
		assert.Contains(t, argsStr, "openai-proxy.company.com", "Should include OpenAI custom hostname")
		assert.Contains(t, argsStr, "--anthropic-api-target", "Should include --anthropic-api-target flag")
		assert.Contains(t, argsStr, "anthropic-proxy.company.com", "Should include Anthropic custom hostname")
	})
}

// TestExtractAPIBasePath tests the extractAPIBasePath function that extracts
// path components from custom API base URLs in engine.env
func TestExtractAPIBasePath(t *testing.T) {
	tests := []struct {
		name     string
		url      string
		expected string
	}{
		{"databricks serving endpoint", "https://host.com/serving-endpoints", "/serving-endpoints"},
		{"azure openai deployment", "https://host.com/openai/deployments/gpt-4", "/openai/deployments/gpt-4"},
		{"simple path", "https://host.com/v1", "/v1"},
		{"trailing slash stripped", "https://host.com/api/", "/api"},
		{"multiple trailing slashes stripped", "https://host.com/api///", "/api"},
		{"no path", "https://host.com", ""},
		{"bare hostname", "host.com", ""},
		{"root path only", "https://host.com/", ""},
		{"query string stripped", "https://host.com/api?param=value", "/api"},
		{"fragment stripped", "https://host.com/api#section", "/api"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			workflowData := &WorkflowData{
				EngineConfig: &EngineConfig{
					Env: map[string]string{
						"OPENAI_BASE_URL": tt.url,
					},
				},
			}
			result := extractAPIBasePath(workflowData, "OPENAI_BASE_URL")
			assert.Equal(t, tt.expected, result, "Extracted base path should match expected value")
		})
	}

	t.Run("returns empty string when workflow data is nil", func(t *testing.T) {
		result := extractAPIBasePath(nil, "OPENAI_BASE_URL")
		assert.Empty(t, result, "Should return empty string for nil workflow data")
	})

	t.Run("returns empty string when engine config is nil", func(t *testing.T) {
		workflowData := &WorkflowData{EngineConfig: nil}
		result := extractAPIBasePath(workflowData, "OPENAI_BASE_URL")
		assert.Empty(t, result, "Should return empty string when engine config is nil")
	})

	t.Run("returns empty string when env var not set", func(t *testing.T) {
		workflowData := &WorkflowData{
			EngineConfig: &EngineConfig{
				Env: map[string]string{"OTHER_VAR": "value"},
			},
		}
		result := extractAPIBasePath(workflowData, "OPENAI_BASE_URL")
		assert.Empty(t, result, "Should return empty string when env var not set")
	})
}

// TestAWFBasePathFlags tests that BuildAWFArgs includes --openai-api-base-path and
// --anthropic-api-base-path when the configured URLs contain a path component
func TestAWFBasePathFlags(t *testing.T) {
	t.Run("includes openai-api-base-path when OPENAI_BASE_URL has path component", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "codex",
				Env: map[string]string{
					"OPENAI_BASE_URL": "https://stone-dataplatform.cloud.databricks.com/serving-endpoints",
					"OPENAI_API_KEY":  "${{ secrets.DATABRICKS_KEY }}",
				},
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{Enabled: true},
			},
		}

		config := AWFCommandConfig{
			EngineName:     "codex",
			WorkflowData:   workflowData,
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.Contains(t, argsStr, "--openai-api-target", "Should include --openai-api-target flag")
		assert.Contains(t, argsStr, "--openai-api-base-path", "Should include --openai-api-base-path flag")
		assert.Contains(t, argsStr, "/serving-endpoints", "Should include the path component")
	})

	t.Run("includes anthropic-api-base-path when ANTHROPIC_BASE_URL has path component", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "claude",
				Env: map[string]string{
					"ANTHROPIC_BASE_URL": "https://proxy.company.com/anthropic/v1",
					"ANTHROPIC_API_KEY":  "${{ secrets.ANTHROPIC_KEY }}",
				},
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{Enabled: true},
			},
		}

		config := AWFCommandConfig{
			EngineName:     "claude",
			WorkflowData:   workflowData,
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.Contains(t, argsStr, "--anthropic-api-target", "Should include --anthropic-api-target flag")
		assert.Contains(t, argsStr, "--anthropic-api-base-path", "Should include --anthropic-api-base-path flag")
		assert.Contains(t, argsStr, "/anthropic/v1", "Should include the path component")
	})

	t.Run("does not include base-path flags when URLs have no path", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "codex",
				Env: map[string]string{
					"OPENAI_BASE_URL":    "https://openai-proxy.company.com",
					"ANTHROPIC_BASE_URL": "https://anthropic-proxy.company.com",
				},
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{Enabled: true},
			},
		}

		config := AWFCommandConfig{
			EngineName:     "codex",
			WorkflowData:   workflowData,
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.NotContains(t, argsStr, "--openai-api-base-path", "Should not include --openai-api-base-path when no path in URL")
		assert.NotContains(t, argsStr, "--anthropic-api-base-path", "Should not include --anthropic-api-base-path when no path in URL")
	})
}

// TestBuildAWFArgsAuditDir tests that BuildAWFArgs always includes --audit-dir
// pointing to the AWF audit directory for policy-manifest.json and other audit files
func TestBuildAWFArgsAuditDir(t *testing.T) {
	t.Run("includes --audit-dir flag with correct path", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "copilot",
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{
					Enabled: true,
				},
			},
		}

		config := AWFCommandConfig{
			EngineName:     "copilot",
			WorkflowData:   workflowData,
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.Contains(t, argsStr, "--audit-dir", "Should include --audit-dir flag")
		assert.Contains(t, argsStr, "/tmp/gh-aw/sandbox/firewall/audit", "Should include the audit directory path")
	})
}

// TestBuildAWFArgsMemoryLimit tests that BuildAWFArgs passes --memory-limit
// when sandbox.agent.memory is configured in the workflow frontmatter
func TestBuildAWFArgsMemoryLimit(t *testing.T) {
	t.Run("includes --memory-limit flag when memory is configured", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "copilot",
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{
					Enabled: true,
				},
			},
			SandboxConfig: &SandboxConfig{
				Agent: &AgentSandboxConfig{
					Memory: "6g",
				},
			},
		}

		config := AWFCommandConfig{
			EngineName:     "copilot",
			WorkflowData:   workflowData,
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.Contains(t, argsStr, "--memory-limit", "Should include --memory-limit flag")
		assert.Contains(t, argsStr, "6g", "Should include the memory value")
	})

	t.Run("does not include --memory-limit flag when memory is not configured", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "copilot",
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{
					Enabled: true,
				},
			},
		}

		config := AWFCommandConfig{
			EngineName:     "copilot",
			WorkflowData:   workflowData,
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.NotContains(t, argsStr, "--memory-limit", "Should not include --memory-limit when memory is not configured")
	})

	t.Run("includes correct memory value when multiple sizes configured", func(t *testing.T) {
		for _, memory := range []string{"512m", "4g", "8g"} {
			t.Run(memory, func(t *testing.T) {
				workflowData := &WorkflowData{
					Name: "test-workflow",
					EngineConfig: &EngineConfig{
						ID: "copilot",
					},
					SandboxConfig: &SandboxConfig{
						Agent: &AgentSandboxConfig{
							Memory: memory,
						},
					},
				}

				config := AWFCommandConfig{
					EngineName:     "copilot",
					WorkflowData:   workflowData,
					AllowedDomains: "github.com",
				}

				args := BuildAWFArgs(config)
				argsStr := strings.Join(args, " ")

				assert.Contains(t, argsStr, "--memory-limit", "Should include --memory-limit flag")
				assert.Contains(t, argsStr, memory, "Should include the correct memory value")
			})
		}
	})
}

// TestEngineExecutionWithCustomAPITarget tests that engine execution steps include
// custom API target flags when configured in engine.env
func TestEngineExecutionWithCustomAPITarget(t *testing.T) {
	t.Run("Codex engine includes openai-api-target flag when OPENAI_BASE_URL is configured", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "codex",
				Env: map[string]string{
					"OPENAI_BASE_URL": "https://llm-router.internal.example.com/v1",
					"OPENAI_API_KEY":  "${{ secrets.LLM_ROUTER_KEY }}",
				},
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{
					Enabled: true,
				},
			},
		}

		engine := NewCodexEngine()
		steps := engine.GetExecutionSteps(workflowData, "test.log")

		assert.NotEmpty(t, steps, "Should generate execution steps")

		stepContent := strings.Join(steps[0], "\n")

		assert.Contains(t, stepContent, "--openai-api-target", "Should include --openai-api-target flag")
		assert.Contains(t, stepContent, "llm-router.internal.example.com", "Should include custom hostname")
	})

	t.Run("Claude engine includes anthropic-api-target flag when ANTHROPIC_BASE_URL is configured", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "claude",
				Env: map[string]string{
					"ANTHROPIC_BASE_URL": "https://claude-proxy.internal.company.com",
					"ANTHROPIC_API_KEY":  "${{ secrets.CLAUDE_PROXY_KEY }}",
				},
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{
					Enabled: true,
				},
			},
		}

		engine := NewClaudeEngine()
		steps := engine.GetExecutionSteps(workflowData, "test.log")

		assert.NotEmpty(t, steps, "Should generate execution steps")

		stepContent := strings.Join(steps[0], "\n")

		assert.Contains(t, stepContent, "--anthropic-api-target", "Should include --anthropic-api-target flag")
		assert.Contains(t, stepContent, "claude-proxy.internal.company.com", "Should include custom hostname")
	})
}

// TestGetCopilotAPITarget tests the GetCopilotAPITarget helper that resolves the effective
// Copilot API target from either engine.api-target or GITHUB_COPILOT_BASE_URL in engine.env.
func TestGetCopilotAPITarget(t *testing.T) {
	tests := []struct {
		name         string
		workflowData *WorkflowData
		expected     string
	}{
		{
			name: "engine.api-target takes precedence over GITHUB_COPILOT_BASE_URL",
			workflowData: &WorkflowData{
				EngineConfig: &EngineConfig{
					ID:        "copilot",
					APITarget: "api.acme.ghe.com",
					Env: map[string]string{
						"GITHUB_COPILOT_BASE_URL": "https://other.endpoint.com",
					},
				},
			},
			expected: "api.acme.ghe.com",
		},
		{
			name: "GITHUB_COPILOT_BASE_URL used as fallback when api-target not set",
			workflowData: &WorkflowData{
				EngineConfig: &EngineConfig{
					ID: "copilot",
					Env: map[string]string{
						"GITHUB_COPILOT_BASE_URL": "https://copilot-api.contoso-aw.ghe.com",
					},
				},
			},
			expected: "copilot-api.contoso-aw.ghe.com",
		},
		{
			name: "GITHUB_COPILOT_BASE_URL with path extracts hostname only",
			workflowData: &WorkflowData{
				EngineConfig: &EngineConfig{
					ID: "copilot",
					Env: map[string]string{
						"GITHUB_COPILOT_BASE_URL": "https://copilot-proxy.corp.example.com/v1",
					},
				},
			},
			expected: "copilot-proxy.corp.example.com",
		},
		{
			name: "empty when neither api-target nor GITHUB_COPILOT_BASE_URL is set",
			workflowData: &WorkflowData{
				EngineConfig: &EngineConfig{
					ID: "copilot",
				},
			},
			expected: "",
		},
		{
			name:         "empty when workflowData is nil",
			workflowData: nil,
			expected:     "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := GetCopilotAPITarget(tt.workflowData)
			assert.Equal(t, tt.expected, result, "GetCopilotAPITarget should return expected hostname")
		})
	}
}

// TestCopilotEngineIncludesCopilotAPITargetFromEnvVar tests that the Copilot engine execution
// step includes --copilot-api-target when GITHUB_COPILOT_BASE_URL is configured in engine.env.
func TestCopilotEngineIncludesCopilotAPITargetFromEnvVar(t *testing.T) {
	workflowData := &WorkflowData{
		Name: "test-workflow",
		EngineConfig: &EngineConfig{
			ID: "copilot",
			Env: map[string]string{
				"GITHUB_COPILOT_BASE_URL": "https://copilot-api.contoso-aw.ghe.com",
			},
		},
		NetworkPermissions: &NetworkPermissions{
			Firewall: &FirewallConfig{
				Enabled: true,
			},
		},
	}

	engine := NewCopilotEngine()
	steps := engine.GetExecutionSteps(workflowData, "test.log")

	assert.NotEmpty(t, steps, "Should generate execution steps")

	stepContent := strings.Join(steps[0], "\n")

	assert.Contains(t, stepContent, "--copilot-api-target", "Should include --copilot-api-target flag")
	assert.Contains(t, stepContent, "copilot-api.contoso-aw.ghe.com", "Should include custom Copilot hostname")
}

// TestAWFSupportsExcludeEnv verifies that --exclude-env is only enabled for AWF v0.25.3+.
func TestAWFSupportsExcludeEnv(t *testing.T) {
	tests := []struct {
		name           string
		firewallConfig *FirewallConfig
		want           bool
	}{
		{
			name:           "nil firewall config (default version) supports --exclude-env",
			firewallConfig: nil,
			want:           true,
		},
		{
			name:           "empty version (default) supports --exclude-env",
			firewallConfig: &FirewallConfig{},
			want:           true,
		},
		{
			name:           "v0.25.3 supports --exclude-env",
			firewallConfig: &FirewallConfig{Version: "v0.25.3"},
			want:           true,
		},
		{
			name:           "v0.26.0 supports --exclude-env",
			firewallConfig: &FirewallConfig{Version: "v0.26.0"},
			want:           true,
		},
		{
			name:           "v0.27.0 supports --exclude-env",
			firewallConfig: &FirewallConfig{Version: "v0.27.0"},
			want:           true,
		},
		{
			name:           "latest supports --exclude-env",
			firewallConfig: &FirewallConfig{Version: "latest"},
			want:           true,
		},
		{
			name:           "v0.25.0 does not support --exclude-env",
			firewallConfig: &FirewallConfig{Version: "v0.25.0"},
			want:           false,
		},
		{
			name:           "v0.1.0 does not support --exclude-env",
			firewallConfig: &FirewallConfig{Version: "v0.1.0"},
			want:           false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := awfSupportsExcludeEnv(tt.firewallConfig)
			assert.Equal(t, tt.want, got, "awfSupportsExcludeEnv result")
		})
	}
}

// TestBuildAWFArgsCliProxy tests that BuildAWFArgs correctly injects --enable-cli-proxy
// and --cli-proxy-policy based on the cli-proxy feature flag.
func TestBuildAWFArgsCliProxy(t *testing.T) {
	baseWorkflow := func(features map[string]any, tools map[string]any) *WorkflowData {
		return &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "copilot",
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{Enabled: true},
			},
			Features: features,
			Tools:    tools,
		}
	}

	t.Run("does not include --enable-cli-proxy when feature flag is absent", func(t *testing.T) {
		config := AWFCommandConfig{
			EngineName:     "copilot",
			WorkflowData:   baseWorkflow(nil, nil),
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.NotContains(t, argsStr, "--enable-cli-proxy", "Should not include --enable-cli-proxy when feature flag is absent")
		assert.NotContains(t, argsStr, "--cli-proxy-policy", "Should not include --cli-proxy-policy when feature flag is absent")
	})

	t.Run("includes --enable-cli-proxy when cli-proxy feature flag is enabled", func(t *testing.T) {
		config := AWFCommandConfig{
			EngineName: "copilot",
			WorkflowData: baseWorkflow(
				map[string]any{"cli-proxy": true},
				nil,
			),
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.Contains(t, argsStr, "--enable-cli-proxy", "Should include --enable-cli-proxy when cli-proxy feature flag is enabled")
	})

	t.Run("includes --cli-proxy-policy with guard policy when tools.github has min-integrity", func(t *testing.T) {
		config := AWFCommandConfig{
			EngineName: "copilot",
			WorkflowData: baseWorkflow(
				map[string]any{"cli-proxy": true},
				map[string]any{
					"github": map[string]any{
						"min-integrity": "approved",
					},
				},
			),
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.Contains(t, argsStr, "--enable-cli-proxy", "Should include --enable-cli-proxy")
		assert.Contains(t, argsStr, "--cli-proxy-policy", "Should include --cli-proxy-policy when guard policy is configured")
		assert.Contains(t, argsStr, "approved", "Policy JSON should contain the min-integrity value")
	})

	t.Run("does not include --cli-proxy-policy when no guard policy fields configured", func(t *testing.T) {
		config := AWFCommandConfig{
			EngineName: "copilot",
			WorkflowData: baseWorkflow(
				map[string]any{"cli-proxy": true},
				map[string]any{
					"github": map[string]any{
						"toolsets": []string{"default"},
					},
				},
			),
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.Contains(t, argsStr, "--enable-cli-proxy", "Should include --enable-cli-proxy")
		assert.NotContains(t, argsStr, "--cli-proxy-policy", "Should not include --cli-proxy-policy when no guard policy fields are configured")
	})

	t.Run("includes --cli-proxy-policy with allowed-repos when configured", func(t *testing.T) {
		config := AWFCommandConfig{
			EngineName: "copilot",
			WorkflowData: baseWorkflow(
				map[string]any{"cli-proxy": true},
				map[string]any{
					"github": map[string]any{
						"min-integrity": "merged",
						"allowed-repos": "owner/*",
					},
				},
			),
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.Contains(t, argsStr, "--cli-proxy-policy", "Should include --cli-proxy-policy")
		assert.Contains(t, argsStr, "merged", "Policy JSON should contain the min-integrity value")
		assert.Contains(t, argsStr, "owner/*", "Policy JSON should contain the allowed-repos value")
	})

	t.Run("skips all cli-proxy flags when AWF version is too old", func(t *testing.T) {
		// Simulate a workflow that pins an AWF version older than v0.25.14
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "copilot",
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{
					Enabled: true,
					Version: "v0.25.13", // older than AWFCliProxyMinVersion
				},
			},
			Features: map[string]any{
				"cli-proxy": true,
			},
			Tools: map[string]any{
				"github": map[string]any{
					"min-integrity": "approved",
				},
			},
		}

		config := AWFCommandConfig{
			EngineName:     "copilot",
			WorkflowData:   workflowData,
			AllowedDomains: "github.com",
		}

		args := BuildAWFArgs(config)
		argsStr := strings.Join(args, " ")

		assert.NotContains(t, argsStr, "--enable-cli-proxy", "Should not include --enable-cli-proxy for AWF < v0.25.14")
		assert.NotContains(t, argsStr, "--cli-proxy-policy", "Should not include --cli-proxy-policy for AWF < v0.25.14")
	})
}

// TestAWFSupportsCliProxy tests the awfSupportsCliProxy version gate function.
func TestAWFSupportsCliProxy(t *testing.T) {
	tests := []struct {
		name           string
		firewallConfig *FirewallConfig
		want           bool
	}{
		{
			name:           "nil firewall config returns true (uses default version)",
			firewallConfig: nil,
			want:           true,
		},
		{
			name:           "empty version returns true (uses default version)",
			firewallConfig: &FirewallConfig{},
			want:           true,
		},
		{
			name:           "latest returns true",
			firewallConfig: &FirewallConfig{Version: "latest"},
			want:           true,
		},
		{
			name:           "v0.25.14 supports --enable-cli-proxy (exact minimum version)",
			firewallConfig: &FirewallConfig{Version: "v0.25.14"},
			want:           true,
		},
		{
			name:           "v0.26.0 supports --enable-cli-proxy",
			firewallConfig: &FirewallConfig{Version: "v0.26.0"},
			want:           true,
		},
		{
			name:           "v0.25.13 does not support --enable-cli-proxy",
			firewallConfig: &FirewallConfig{Version: "v0.25.13"},
			want:           false,
		},
		{
			name:           "v0.25.3 does not support --enable-cli-proxy",
			firewallConfig: &FirewallConfig{Version: "v0.25.3"},
			want:           false,
		},
		{
			name:           "v0.1.0 does not support --enable-cli-proxy",
			firewallConfig: &FirewallConfig{Version: "v0.1.0"},
			want:           false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := awfSupportsCliProxy(tt.firewallConfig)
			assert.Equal(t, tt.want, got, "awfSupportsCliProxy result")
		})
	}
}

// TestIsEnvVarExpression verifies that isEnvVarExpression correctly identifies
// GitHub Actions expression strings in engine.env vars.
func TestIsEnvVarExpression(t *testing.T) {
	tests := []struct {
		name     string
		data     *WorkflowData
		envVar   string
		expected bool
	}{
		{
			name: "expression value returns true",
			data: &WorkflowData{
				EngineConfig: &EngineConfig{
					Env: map[string]string{"ANTHROPIC_BASE_URL": "${{ vars.ANTHROPIC_BASE_URL }}"},
				},
			},
			envVar:   "ANTHROPIC_BASE_URL",
			expected: true,
		},
		{
			name: "hardcoded URL returns false",
			data: &WorkflowData{
				EngineConfig: &EngineConfig{
					Env: map[string]string{"ANTHROPIC_BASE_URL": "https://my-gateway.example.com"},
				},
			},
			envVar:   "ANTHROPIC_BASE_URL",
			expected: false,
		},
		{
			name:     "nil workflowData returns false",
			data:     nil,
			envVar:   "ANTHROPIC_BASE_URL",
			expected: false,
		},
		{
			name: "missing env var returns false",
			data: &WorkflowData{
				EngineConfig: &EngineConfig{
					Env: map[string]string{"OTHER_VAR": "${{ vars.OTHER }}"},
				},
			},
			envVar:   "ANTHROPIC_BASE_URL",
			expected: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := isEnvVarExpression(tt.data, tt.envVar)
			assert.Equal(t, tt.expected, got, "isEnvVarExpression result")
		})
	}
}

// TestBuildExpressionAPITargetArgs verifies that buildExpressionAPITargetArgs generates
// correct shell preamble and expandable args for expression-based API target values.
func TestBuildExpressionAPITargetArgs(t *testing.T) {
	t.Run("generates preamble and expandable arg for expression-based ANTHROPIC_BASE_URL", func(t *testing.T) {
		workflowData := &WorkflowData{
			EngineConfig: &EngineConfig{
				Env: map[string]string{
					"ANTHROPIC_BASE_URL": "${{ vars.ANTHROPIC_BASE_URL }}",
				},
			},
		}

		preamble, expandable := buildExpressionAPITargetArgs(workflowData)

		assert.Contains(t, preamble, "_GH_AW_ANTHROPIC_TARGET='${{ vars.ANTHROPIC_BASE_URL }}'", "Preamble should assign the expression to a variable")
		assert.Contains(t, preamble, `_GH_AW_ANTHROPIC_TARGET="${_GH_AW_ANTHROPIC_TARGET#https://}"`, "Preamble should strip https://")
		assert.Contains(t, preamble, `_GH_AW_ANTHROPIC_TARGET="${_GH_AW_ANTHROPIC_TARGET#http://}"`, "Preamble should strip http://")
		assert.Contains(t, preamble, `_GH_AW_ANTHROPIC_TARGET="${_GH_AW_ANTHROPIC_TARGET%%/*}"`, "Preamble should strip path suffix")
		assert.Contains(t, expandable, `--anthropic-api-target "${_GH_AW_ANTHROPIC_TARGET}"`, "Expandable args should reference the shell variable")
		assert.NotContains(t, expandable, "--openai-api-target", "Should not include unrelated flags")
	})

	t.Run("generates preamble and expandable arg for expression-based OPENAI_BASE_URL", func(t *testing.T) {
		workflowData := &WorkflowData{
			EngineConfig: &EngineConfig{
				Env: map[string]string{
					"OPENAI_BASE_URL": "${{ vars.OPENAI_BASE_URL }}",
				},
			},
		}

		preamble, expandable := buildExpressionAPITargetArgs(workflowData)

		assert.Contains(t, preamble, "_GH_AW_OPENAI_TARGET='${{ vars.OPENAI_BASE_URL }}'", "Preamble should assign the expression")
		assert.Contains(t, preamble, `_GH_AW_OPENAI_TARGET="${_GH_AW_OPENAI_TARGET%%/*}"`, "Preamble should strip path")
		assert.Contains(t, expandable, `--openai-api-target "${_GH_AW_OPENAI_TARGET}"`, "Expandable args should reference shell variable")
	})

	t.Run("generates preamble for both when both are expressions", func(t *testing.T) {
		workflowData := &WorkflowData{
			EngineConfig: &EngineConfig{
				Env: map[string]string{
					"OPENAI_BASE_URL":    "${{ vars.OPENAI_BASE_URL }}",
					"ANTHROPIC_BASE_URL": "${{ vars.ANTHROPIC_BASE_URL }}",
				},
			},
		}

		preamble, expandable := buildExpressionAPITargetArgs(workflowData)

		assert.Contains(t, preamble, "_GH_AW_OPENAI_TARGET", "Preamble should include OpenAI variable")
		assert.Contains(t, preamble, "_GH_AW_ANTHROPIC_TARGET", "Preamble should include Anthropic variable")
		assert.Contains(t, expandable, "--openai-api-target", "Expandable should include OpenAI flag")
		assert.Contains(t, expandable, "--anthropic-api-target", "Expandable should include Anthropic flag")
	})

	t.Run("returns empty strings when no expressions present", func(t *testing.T) {
		workflowData := &WorkflowData{
			EngineConfig: &EngineConfig{
				Env: map[string]string{
					"ANTHROPIC_BASE_URL": "https://my-gateway.example.com",
				},
			},
		}

		preamble, expandable := buildExpressionAPITargetArgs(workflowData)

		assert.Empty(t, preamble, "No preamble needed for hardcoded URLs")
		assert.Empty(t, expandable, "No expandable args needed for hardcoded URLs")
	})

	t.Run("returns empty strings for nil workflowData", func(t *testing.T) {
		preamble, expandable := buildExpressionAPITargetArgs(nil)

		assert.Empty(t, preamble, "Should return empty preamble for nil workflowData")
		assert.Empty(t, expandable, "Should return empty expandable for nil workflowData")
	})
}

// TestBuildAWFCommandExpressionAPITarget verifies that BuildAWFCommand inserts the
// scheme-stripping preamble into the generated shell script when an API target
// environment variable is a GitHub Actions expression.
func TestBuildAWFCommandExpressionAPITarget(t *testing.T) {
	t.Run("inserts scheme-stripping preamble for expression-based ANTHROPIC_BASE_URL", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "claude",
				Env: map[string]string{
					"ANTHROPIC_BASE_URL": "${{ vars.ANTHROPIC_BASE_URL }}",
					"ANTHROPIC_API_KEY":  "${{ secrets.ANTHROPIC_API_KEY }}",
				},
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{Enabled: true},
			},
		}

		config := AWFCommandConfig{
			EngineName:     "claude",
			EngineCommand:  "claude --print",
			LogFile:        "/tmp/test.log",
			WorkflowData:   workflowData,
			AllowedDomains: "github.com",
		}

		command := BuildAWFCommand(config)

		assert.Contains(t, command, "_GH_AW_ANTHROPIC_TARGET='${{ vars.ANTHROPIC_BASE_URL }}'", "Command should contain preamble variable assignment")
		assert.Contains(t, command, `--anthropic-api-target "${_GH_AW_ANTHROPIC_TARGET}"`, "Command should use shell variable for api-target")
		assert.NotContains(t, command, "--anthropic-api-target '${{ vars.ANTHROPIC_BASE_URL }}'", "Command must not pass raw expression as api-target value")
		assert.NotContains(t, command, "--anthropic-api-target ${{ vars.ANTHROPIC_BASE_URL }}", "Command must not pass raw expression without quotes")
	})

	t.Run("inserts scheme-stripping preamble for expression-based OPENAI_BASE_URL", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "codex",
				Env: map[string]string{
					"OPENAI_BASE_URL": "${{ vars.OPENAI_BASE_URL }}",
					"OPENAI_API_KEY":  "${{ secrets.OPENAI_API_KEY }}",
				},
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{Enabled: true},
			},
		}

		config := AWFCommandConfig{
			EngineName:     "codex",
			EngineCommand:  "codex",
			LogFile:        "/tmp/test.log",
			WorkflowData:   workflowData,
			AllowedDomains: "github.com",
		}

		command := BuildAWFCommand(config)

		assert.Contains(t, command, "_GH_AW_OPENAI_TARGET='${{ vars.OPENAI_BASE_URL }}'", "Command should contain preamble for OpenAI")
		assert.Contains(t, command, `--openai-api-target "${_GH_AW_OPENAI_TARGET}"`, "Command should use shell variable for openai api-target")
	})

	t.Run("preamble combined with PathSetup when both present", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "codex",
				Env: map[string]string{
					"OPENAI_BASE_URL": "${{ vars.OPENAI_BASE_URL }}",
				},
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{Enabled: true},
			},
		}

		config := AWFCommandConfig{
			EngineName:     "codex",
			EngineCommand:  "codex",
			LogFile:        "/tmp/test.log",
			WorkflowData:   workflowData,
			AllowedDomains: "github.com",
			PathSetup:      "export PATH=/custom/bin:$PATH",
		}

		command := BuildAWFCommand(config)

		assert.Contains(t, command, "export PATH=/custom/bin:$PATH", "Command should include PathSetup")
		assert.Contains(t, command, "_GH_AW_OPENAI_TARGET", "Command should include expression preamble")
	})

	t.Run("no preamble for hardcoded API target URLs", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "claude",
				Env: map[string]string{
					"ANTHROPIC_BASE_URL": "https://my-gateway.example.com",
				},
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{Enabled: true},
			},
		}

		config := AWFCommandConfig{
			EngineName:     "claude",
			EngineCommand:  "claude --print",
			LogFile:        "/tmp/test.log",
			WorkflowData:   workflowData,
			AllowedDomains: "github.com",
		}

		command := BuildAWFCommand(config)

		assert.NotContains(t, command, "_GH_AW_ANTHROPIC_TARGET", "No preamble variable needed for hardcoded URLs")
		assert.Contains(t, command, "--anthropic-api-target my-gateway.example.com", "Hardcoded hostname should appear as static arg")
	})
}
