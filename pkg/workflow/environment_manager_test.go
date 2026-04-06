//go:build !integration

package workflow

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewEnvironmentManager(t *testing.T) {
	em := NewEnvironmentManager()
	require.NotNil(t, em, "NewEnvironmentManager should return a non-nil manager")
}

func TestDeploymentTargetString(t *testing.T) {
	tests := []struct {
		name     string
		target   DeploymentTarget
		expected string
	}{
		{
			name:     "auto target",
			target:   DeploymentTargetAuto,
			expected: "auto",
		},
		{
			name:     "github.com target",
			target:   DeploymentTargetGitHubCom,
			expected: "github.com",
		},
		{
			name:     "github enterprise target",
			target:   DeploymentTargetGitHubEnterprise,
			expected: "github-enterprise",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.expected, tt.target.String(), "deployment target string representation should match")
		})
	}
}

func TestApplyDeploymentTarget_GitHubCom(t *testing.T) {
	em := NewEnvironmentManager()

	t.Run("sets GH_HOST on step with no existing env", func(t *testing.T) {
		step := &WorkflowStep{Name: "my-step"}

		em.ApplyDeploymentTarget(step, DeploymentTargetGitHubCom)

		require.NotNil(t, step.Env, "Env map should be initialised")
		assert.Equal(t, "github.com", step.Env[ghHostEnvVar], "GH_HOST should be set to github.com")
	})

	t.Run("sets GH_HOST on step with existing env", func(t *testing.T) {
		step := &WorkflowStep{
			Name: "my-step",
			Env:  map[string]string{"SOME_VAR": "value"},
		}

		em.ApplyDeploymentTarget(step, DeploymentTargetGitHubCom)

		assert.Equal(t, "github.com", step.Env[ghHostEnvVar], "GH_HOST should be set to github.com")
		assert.Equal(t, "value", step.Env["SOME_VAR"], "existing env vars should be preserved")
	})

	t.Run("overwrites a GHE GH_HOST override", func(t *testing.T) {
		step := &WorkflowStep{
			Name: "my-step",
			Env:  map[string]string{ghHostEnvVar: "myorg.ghe.com"},
		}

		em.ApplyDeploymentTarget(step, DeploymentTargetGitHubCom)

		assert.Equal(t, "github.com", step.Env[ghHostEnvVar], "GH_HOST should be overwritten with github.com")
	})
}

func TestApplyDeploymentTarget_GitHubEnterprise(t *testing.T) {
	em := NewEnvironmentManager()

	t.Run("removes GH_HOST pin from step env", func(t *testing.T) {
		step := &WorkflowStep{
			Name: "my-step",
			Env:  map[string]string{ghHostEnvVar: "github.com", "OTHER": "val"},
		}

		em.ApplyDeploymentTarget(step, DeploymentTargetGitHubEnterprise)

		_, hasGHHost := step.Env[ghHostEnvVar]
		assert.False(t, hasGHHost, "GH_HOST pin should be removed so step inherits job-level GHE host")
		assert.Equal(t, "val", step.Env["OTHER"], "other env vars should be preserved")
	})

	t.Run("does nothing when GH_HOST is not pinned", func(t *testing.T) {
		step := &WorkflowStep{
			Name: "my-step",
			Env:  map[string]string{"OTHER": "val"},
		}

		em.ApplyDeploymentTarget(step, DeploymentTargetGitHubEnterprise)

		_, hasGHHost := step.Env[ghHostEnvVar]
		assert.False(t, hasGHHost, "GH_HOST should remain absent")
		assert.Equal(t, "val", step.Env["OTHER"], "other env vars should be preserved")
	})

	t.Run("does nothing when step has no env", func(t *testing.T) {
		step := &WorkflowStep{Name: "my-step"}

		em.ApplyDeploymentTarget(step, DeploymentTargetGitHubEnterprise)

		assert.Nil(t, step.Env, "Env map should remain nil when no changes were needed")
	})
}

func TestApplyDeploymentTarget_Auto(t *testing.T) {
	em := NewEnvironmentManager()

	t.Run("does not modify step env", func(t *testing.T) {
		step := &WorkflowStep{
			Name: "my-step",
			Env:  map[string]string{"SOME_VAR": "value"},
		}

		em.ApplyDeploymentTarget(step, DeploymentTargetAuto)

		assert.Equal(t, map[string]string{"SOME_VAR": "value"}, step.Env, "env map should be unchanged for auto target")
	})

	t.Run("does not initialise nil env map", func(t *testing.T) {
		step := &WorkflowStep{Name: "my-step"}

		em.ApplyDeploymentTarget(step, DeploymentTargetAuto)

		assert.Nil(t, step.Env, "Env map should remain nil for auto target")
	})
}

func TestEnvVarsForTarget(t *testing.T) {
	em := NewEnvironmentManager()

	t.Run("github.com target returns GH_HOST override", func(t *testing.T) {
		vars := em.EnvVarsForTarget(DeploymentTargetGitHubCom)

		require.NotNil(t, vars, "should return a non-nil map")
		assert.Equal(t, "github.com", vars[ghHostEnvVar], "should include GH_HOST=github.com")
	})

	t.Run("github enterprise target returns empty non-nil map", func(t *testing.T) {
		vars := em.EnvVarsForTarget(DeploymentTargetGitHubEnterprise)

		require.NotNil(t, vars, "should return a non-nil map (signals GH_HOST must not be set)")
		assert.Empty(t, vars, "map should be empty for GHE target (no step-level overrides)")
	})

	t.Run("auto target returns nil", func(t *testing.T) {
		vars := em.EnvVarsForTarget(DeploymentTargetAuto)

		assert.Nil(t, vars, "should return nil for auto target (no overrides)")
	})

	t.Run("returned map is safe to modify", func(t *testing.T) {
		vars1 := em.EnvVarsForTarget(DeploymentTargetGitHubCom)
		vars1["EXTRA"] = "extra-value"

		vars2 := em.EnvVarsForTarget(DeploymentTargetGitHubCom)
		_, hasExtra := vars2["EXTRA"]
		assert.False(t, hasExtra, "modifying a returned map should not affect subsequent calls")
	})
}

func TestEnvironmentManagerIntegration_CopilotInstallerUsesGitHubCom(t *testing.T) {
	// Verify that the copilot installer produces steps that pin GH_HOST to github.com,
	// which is the observable behaviour of using DeploymentTargetGitHubCom.
	steps := GenerateCopilotInstallerSteps("latest", "Install Copilot CLI")

	require.Len(t, steps, 1, "should produce exactly one install step")
	stepContent := joinLines(steps[0])

	assert.Contains(t, stepContent, ghHostEnvVar+": "+githubComHost,
		"copilot installer step must pin GH_HOST to github.com via DeploymentTargetGitHubCom")
}

func TestEnvironmentManagerIntegration_AWFInstallerUsesGitHubCom(t *testing.T) {
	// Verify that the AWF installer step pins GH_HOST to github.com.
	// AWF is downloaded from GitHub releases at github.com so it must not be
	// affected by a workflow-level GHE GH_HOST override.
	step := generateAWFInstallationStep("v0.25.10", nil)

	require.NotEmpty(t, step, "should produce a non-empty AWF install step")
	stepContent := joinLines(step)

	assert.Contains(t, stepContent, "Install AWF binary",
		"AWF install step should have expected name")
	assert.Contains(t, stepContent, ghHostEnvVar+": "+githubComHost,
		"AWF installer step must pin GH_HOST to github.com via DeploymentTargetGitHubCom")
}

// joinLines joins a GitHubActionStep ([]string) into a single string for assertion.
func joinLines(step GitHubActionStep) string {
	var sb strings.Builder
	for _, line := range step {
		sb.WriteString(line)
		sb.WriteByte('\n')
	}
	return sb.String()
}
