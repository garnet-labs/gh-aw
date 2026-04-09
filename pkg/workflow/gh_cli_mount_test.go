//go:build !integration

package workflow

import (
	"strings"
	"testing"

	"github.com/github/gh-aw/pkg/constants"
)

// TestChrootModeInAWFContainer tests that AWF uses chroot mode (default in v0.15.0+) for transparent host access
func TestChrootModeInAWFContainer(t *testing.T) {
	t.Run("chroot mode is enabled by default when firewall is enabled", func(t *testing.T) {
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

		engine := NewCopilotEngine()
		steps := engine.GetExecutionSteps(workflowData, "test.log")

		stepContent := requireCopilotExecutionStep(t, steps)

		// Check that AWF is used (chroot mode is default in v0.15.0+)
		if !strings.Contains(stepContent, "sudo -E awf") {
			t.Error("Expected AWF command for transparent host access")
		}
	})

	t.Run("AWF command is NOT used when firewall is disabled", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "copilot",
			},
			SandboxConfig: &SandboxConfig{
				Agent: &AgentSandboxConfig{
					Disabled: true,
				},
			},
		}

		engine := NewCopilotEngine()
		steps := engine.GetExecutionSteps(workflowData, "test.log")

		stepContent := requireCopilotExecutionStep(t, steps)

		// Check that AWF command is not used
		if strings.Contains(stepContent, "awf") {
			t.Error("Expected no AWF command when firewall is disabled")
		}
	})

	t.Run("chroot mode replaces individual binary mounts", func(t *testing.T) {
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

		engine := NewCopilotEngine()
		steps := engine.GetExecutionSteps(workflowData, "test.log")

		stepContent := requireCopilotExecutionStep(t, steps)

		// Verify AWF is present (chroot mode is default in v0.15.0+)
		if !strings.Contains(stepContent, "sudo -E awf") {
			t.Error("Expected AWF to be present")
		}

		// Verify individual binary mounts are NOT present (replaced by default chroot mode)
		individualMounts := []string{
			"--mount /usr/bin/gh:/usr/bin/gh:ro",
			"--mount /usr/bin/cat:/usr/bin/cat:ro",
			"--mount /usr/bin/jq:/usr/bin/jq:ro",
			"--mount /tmp:/tmp:rw",
			"--mount /opt/hostedtoolcache:/opt/hostedtoolcache:ro",
		}

		for _, mount := range individualMounts {
			if strings.Contains(stepContent, mount) {
				t.Errorf("Individual mount '%s' should be replaced by default chroot mode", mount)
			}
		}
	})

	t.Run("chroot mode works with custom firewall args", func(t *testing.T) {
		workflowData := &WorkflowData{
			Name: "test-workflow",
			EngineConfig: &EngineConfig{
				ID: "copilot",
			},
			NetworkPermissions: &NetworkPermissions{
				Firewall: &FirewallConfig{
					Enabled: true,
					Args:    []string{"--custom-flag", "value"},
				},
			},
		}

		engine := NewCopilotEngine()
		steps := engine.GetExecutionSteps(workflowData, "test.log")

		stepContent := requireCopilotExecutionStep(t, steps)

		// Verify AWF is present with custom args (chroot mode is default in v0.15.0+)
		if !strings.Contains(stepContent, "sudo -E awf") {
			t.Error("Expected AWF to be present with custom firewall args")
		}

		if !strings.Contains(stepContent, "--custom-flag") {
			t.Error("Expected custom firewall args to be present with chroot mode")
		}
	})

	t.Run("chroot mode works with AWF sandbox type", func(t *testing.T) {
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
			// Explicitly set AWF sandbox type
			SandboxConfig: &SandboxConfig{
				Agent: &AgentSandboxConfig{
					ID: "awf",
				},
			},
		}

		engine := NewCopilotEngine()
		steps := engine.GetExecutionSteps(workflowData, "test.log")

		stepContent := requireCopilotExecutionStep(t, steps)

		// Verify AWF is being used (chroot mode is default in v0.15.0+)
		if !strings.Contains(stepContent, "awf") {
			t.Error("Expected AWF to be used when firewall is enabled")
		}
	})
}

// TestChrootModeEnvFlags tests that --env-all is used with chroot mode to pass env vars to AWF
// and that every secret-bearing env var is excluded via --exclude-env
func TestChrootModeEnvFlags(t *testing.T) {
	t.Run("env-all is required for AWF to receive host env vars", func(t *testing.T) {
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

		engine := NewCopilotEngine()
		steps := engine.GetExecutionSteps(workflowData, "test.log")

		stepContent := requireCopilotExecutionStep(t, steps)

		// Verify AWF is present (chroot mode is default in v0.15.0+)
		if !strings.Contains(stepContent, "sudo -E awf") {
			t.Error("Expected AWF to be present")
		}

		// Verify --env-all IS used (required for AWF to receive host environment variables)
		if !strings.Contains(stepContent, "--env-all") {
			t.Error("--env-all is required for AWF to receive host environment variables")
		}

		// Verify COPILOT_GITHUB_TOKEN is excluded via --exclude-env (AWF v0.25.3+ security fix).
		// When copilot-requests is NOT enabled the token is a PAT and must be excluded.
		if !strings.Contains(stepContent, "--exclude-env COPILOT_GITHUB_TOKEN") {
			t.Error("COPILOT_GITHUB_TOKEN must be excluded from container env via --exclude-env when copilot-requests is not enabled")
		}
	})

	t.Run("copilot-requests feature does not exclude COPILOT_GITHUB_TOKEN", func(t *testing.T) {
		// When features: copilot-requests: true is enabled, COPILOT_GITHUB_TOKEN is set to
		// ${{ github.token }} — a scoped Actions token, not a long-lived PAT. The Copilot CLI
		// v1.0.20+ validates this token at startup before making any API calls, so it must be
		// present inside the AWF container. We therefore do NOT exclude it in this mode.
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
			Features: map[string]any{
				string(constants.CopilotRequestsFeatureFlag): true,
			},
		}

		engine := NewCopilotEngine()
		steps := engine.GetExecutionSteps(workflowData, "test.log")

		stepContent := requireCopilotExecutionStep(t, steps)

		// COPILOT_GITHUB_TOKEN must NOT be excluded when copilot-requests is enabled;
		// it holds github.token (scoped) and the Copilot CLI needs it at startup.
		if strings.Contains(stepContent, "--exclude-env COPILOT_GITHUB_TOKEN") {
			t.Error("COPILOT_GITHUB_TOKEN must NOT be excluded from container env when copilot-requests feature is enabled")
		}
	})

	t.Run("github tool adds GITHUB_MCP_SERVER_TOKEN to exclude list", func(t *testing.T) {
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
			ParsedTools: &ToolsConfig{
				GitHub: &GitHubToolConfig{},
			},
		}

		engine := NewCopilotEngine()
		steps := engine.GetExecutionSteps(workflowData, "test.log")

		stepContent := requireCopilotExecutionStep(t, steps)

		// With GitHub tool present, GITHUB_MCP_SERVER_TOKEN must also be excluded
		if !strings.Contains(stepContent, "--exclude-env COPILOT_GITHUB_TOKEN") {
			t.Error("COPILOT_GITHUB_TOKEN must be excluded from container env")
		}
		if !strings.Contains(stepContent, "--exclude-env GITHUB_MCP_SERVER_TOKEN") {
			t.Error("GITHUB_MCP_SERVER_TOKEN must be excluded from container env when GitHub tool is present")
		}
	})
}
