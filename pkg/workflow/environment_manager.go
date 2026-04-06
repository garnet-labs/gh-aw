package workflow

import "github.com/github/gh-aw/pkg/logger"

var environmentManagerLog = logger.New("workflow:environment_manager")

// DeploymentTarget identifies which GitHub deployment a step targets.
//
// GitHub has different deployment types (github.com and GHE/GHES/GHEC), each
// requiring different environment variables. Steps that must use github.com
// endpoints need DeploymentTargetGitHubCom. Steps that should respect the
// enterprise host need DeploymentTargetGitHubEnterprise or DeploymentTargetAuto.
type DeploymentTarget int

const (
	// DeploymentTargetAuto lets the step inherit the deployment context from
	// the job-level configuration (set by the GHES host configuration step).
	// This is the default and works correctly for both github.com and GHE
	// deployments, so most steps should use this target.
	DeploymentTargetAuto DeploymentTarget = iota

	// DeploymentTargetGitHubCom forces the step to execute against github.com.
	// Required for steps that use hardcoded github.com URLs or APIs that are
	// only available on github.com (e.g., Copilot CLI installation).
	//
	// The environment manager sets GH_HOST=github.com at the step level to
	// prevent any job-level GHE host configuration from leaking into this step.
	DeploymentTargetGitHubCom

	// DeploymentTargetGitHubEnterprise ensures the step targets the GHE instance
	// configured for the workflow. Removes any github.com pin so the step
	// inherits the job-level GH_HOST that was set by the GHES host configuration
	// step from GITHUB_SERVER_URL.
	DeploymentTargetGitHubEnterprise
)

// String returns a human-readable representation of the deployment target.
func (dt DeploymentTarget) String() string {
	switch dt {
	case DeploymentTargetGitHubCom:
		return "github.com"
	case DeploymentTargetGitHubEnterprise:
		return "github-enterprise"
	default:
		return "auto"
	}
}

// EnvironmentManager determines the correct environment variable configuration
// for each compilation step based on its deployment target.
//
// GitHub has two main deployment types:
//   - github.com: the public GitHub instance
//   - GHE (GitHub Enterprise): cloud or self-hosted enterprise (*.ghe.com, GHES)
//
// Each deployment type requires different environment variables. This manager
// centralizes the compiler logic for setting or unsetting environment variables
// for each step so that every step communicates with the correct GitHub version.
type EnvironmentManager struct{}

// NewEnvironmentManager creates a new EnvironmentManager.
func NewEnvironmentManager() *EnvironmentManager {
	environmentManagerLog.Print("Creating new environment manager")
	return &EnvironmentManager{}
}

// ApplyDeploymentTarget configures the environment variables on a WorkflowStep
// so that the step executes against the specified GitHub deployment.
//
// For DeploymentTargetGitHubCom:
//   - Sets GH_HOST=github.com at the step level, overriding any job-level GHE
//     host configuration. This prevents GHE env vars from leaking into steps
//     that must contact github.com directly.
//
// For DeploymentTargetGitHubEnterprise:
//   - Removes any step-level GH_HOST pin so the step inherits the job-level
//     GH_HOST that the GHES host configuration step derives from GITHUB_SERVER_URL.
//
// For DeploymentTargetAuto:
//   - No changes are made; the step inherits whatever the job-level configuration provides.
func (em *EnvironmentManager) ApplyDeploymentTarget(step *WorkflowStep, target DeploymentTarget) {
	environmentManagerLog.Printf("Applying deployment target %s to step %q", target, step.Name)

	switch target {
	case DeploymentTargetGitHubCom:
		if step.Env == nil {
			step.Env = make(map[string]string)
		}
		step.Env[ghHostEnvVar] = githubComHost
		environmentManagerLog.Printf("Pinned %s=%s for step %q to run against github.com", ghHostEnvVar, githubComHost, step.Name)

	case DeploymentTargetGitHubEnterprise:
		if step.Env != nil {
			if _, wasPinned := step.Env[ghHostEnvVar]; wasPinned {
				delete(step.Env, ghHostEnvVar)
				environmentManagerLog.Printf("Removed %s pin from step %q to allow GHE host inheritance", ghHostEnvVar, step.Name)
			}
		}

	case DeploymentTargetAuto:
		// No changes needed — step inherits from job-level configuration
		environmentManagerLog.Printf("Step %q uses auto deployment target, no env changes applied", step.Name)
	}
}

// EnvVarsForTarget returns the step-level environment variable overrides
// required for the given deployment target. The returned map is a new copy
// that the caller may modify freely.
//
// Returns nil for DeploymentTargetAuto (no overrides needed).
// Returns {"GH_HOST": "github.com"} for DeploymentTargetGitHubCom.
// Returns an empty (non-nil) map for DeploymentTargetGitHubEnterprise, signalling
// that GH_HOST must not be set at the step level.
func (em *EnvironmentManager) EnvVarsForTarget(target DeploymentTarget) map[string]string {
	switch target {
	case DeploymentTargetGitHubCom:
		return map[string]string{
			ghHostEnvVar: githubComHost,
		}
	case DeploymentTargetGitHubEnterprise:
		return map[string]string{}
	default:
		return nil
	}
}

const (
	// ghHostEnvVar is the environment variable used by the gh CLI to select
	// which GitHub host to connect to.
	ghHostEnvVar = "GH_HOST"

	// githubComHost is the hostname for the public GitHub instance.
	githubComHost = "github.com"
)
