package workflow

import (
	"fmt"
	"sort"
	"strings"

	"github.com/github/gh-aw/pkg/constants"
	"github.com/github/gh-aw/pkg/logger"
)

var dockerLog = logger.New("workflow:docker")

// buildVersionedImageRef constructs a Docker image reference with SHA-256 digest pinning
// for the default image version. When version matches defaultVersion the returned reference
// is "container:version@sha256:digest", providing an immutable content address that defends
// against tag mutation and supply-chain attacks on the registry. For any custom (non-default)
// version the digest is unknown at compile time, so only "container:version" is returned.
func buildVersionedImageRef(container, version, defaultVersion, defaultDigest string) string {
	ref := container + ":" + version
	if version == defaultVersion {
		ref += "@" + defaultDigest
	}
	return ref
}

// collectDockerImages collects all Docker images used in MCP configurations
func collectDockerImages(tools map[string]any, workflowData *WorkflowData, actionMode ActionMode) []string {
	var images []string
	imageSet := make(map[string]bool) // Use a set to avoid duplicates

	// Check for GitHub tool (uses Docker image)
	if githubTool, hasGitHub := tools["github"]; hasGitHub {
		githubType := getGitHubType(githubTool)
		// Only add if using local (Docker) mode
		if githubType == "local" {
			githubDockerImageVersion := getGitHubDockerImageVersion(githubTool)
			image := buildVersionedImageRef(
				"ghcr.io/github/github-mcp-server",
				githubDockerImageVersion,
				string(constants.DefaultGitHubMCPServerVersion),
				constants.DefaultGitHubMCPServerDigest,
			)
			if !imageSet[image] {
				images = append(images, image)
				imageSet[image] = true
			}
		}
	}

	// Check for Playwright tool (uses Docker image - pinned to a versioned tag with SHA-256 digest)
	if _, hasPlaywright := tools["playwright"]; hasPlaywright {
		image := "mcr.microsoft.com/playwright/mcp:" + string(constants.DefaultPlaywrightMCPDockerVersion) + "@" + constants.DefaultPlaywrightMCPDockerDigest
		if !imageSet[image] {
			images = append(images, image)
			imageSet[image] = true
		}
	}

	// Check for safe-outputs MCP server (uses node:lts-alpine container)
	if workflowData != nil && workflowData.SafeOutputs != nil && HasSafeOutputsEnabled(workflowData.SafeOutputs) {
		image := constants.DefaultNodeAlpineLTSImage
		if !imageSet[image] {
			images = append(images, image)
			imageSet[image] = true
			dockerLog.Printf("Added safe-outputs MCP server container: %s", image)
		}
	}

	// Check for agentic-workflows tool
	// In dev mode, the image is built locally in the workflow, so don't add to pull list
	// In release/script mode, use alpine:latest which needs to be pulled
	if _, hasAgenticWorkflows := tools["agentic-workflows"]; hasAgenticWorkflows {
		if !actionMode.IsDev() {
			// Release/script mode: Use alpine:latest (needs to be pulled)
			image := constants.DefaultAlpineImage
			if !imageSet[image] {
				images = append(images, image)
				imageSet[image] = true
				dockerLog.Printf("Added agentic-workflows MCP server container: %s", image)
			}
		}
		// Dev mode: localhost/gh-aw:dev is built locally, not pulled
	}

	// Collect AWF (firewall) container images when firewall is enabled
	// AWF uses three containers: squid (proxy), agent, and api-proxy (for engines with LLM gateway support)
	if isFirewallEnabled(workflowData) {
		// Get the firewall version for image tags
		firewallConfig := getFirewallConfig(workflowData)
		awfImageTag := getAWFImageTag(firewallConfig)
		// Default version for digest comparison (strip 'v' prefix as getAWFImageTag does)
		defaultAWFTag := strings.TrimPrefix(string(constants.DefaultFirewallVersion), "v")

		// Add squid (proxy) container
		squidImage := buildVersionedImageRef(
			constants.DefaultFirewallRegistry+"/squid",
			awfImageTag,
			defaultAWFTag,
			constants.DefaultFirewallSquidDigest,
		)
		if !imageSet[squidImage] {
			images = append(images, squidImage)
			imageSet[squidImage] = true
			dockerLog.Printf("Added AWF squid (proxy) container: %s", squidImage)
		}

		// Add default agent container
		agentImage := buildVersionedImageRef(
			constants.DefaultFirewallRegistry+"/agent",
			awfImageTag,
			defaultAWFTag,
			constants.DefaultFirewallAgentDigest,
		)
		if !imageSet[agentImage] {
			images = append(images, agentImage)
			imageSet[agentImage] = true
			dockerLog.Printf("Added AWF agent container: %s", agentImage)
		}

		// Add api-proxy sidecar container (required for all engines — LLM gateway is mandatory)
		// The api-proxy holds LLM API keys securely and proxies requests through Squid
		// Each engine uses its own dedicated port for communication
		if workflowData != nil && workflowData.AI != "" {
			apiProxyImage := buildVersionedImageRef(
				constants.DefaultFirewallRegistry+"/api-proxy",
				awfImageTag,
				defaultAWFTag,
				constants.DefaultFirewallAPIProxyDigest,
			)
			if !imageSet[apiProxyImage] {
				images = append(images, apiProxyImage)
				imageSet[apiProxyImage] = true
				dockerLog.Printf("Added AWF api-proxy sidecar container: %s", apiProxyImage)
			}
		}
	}

	// Collect sandbox.mcp container (MCP gateway)
	// Skip if sandbox is disabled (sandbox: false)
	if workflowData != nil && workflowData.SandboxConfig != nil {
		// Check if sandbox is disabled
		sandboxDisabled := workflowData.SandboxConfig.Agent != nil && workflowData.SandboxConfig.Agent.Disabled

		if !sandboxDisabled && workflowData.SandboxConfig.MCP != nil {
			mcpGateway := workflowData.SandboxConfig.MCP
			if mcpGateway.Container != "" {
				mcpGatewayVersion := mcpGateway.Version
				if mcpGatewayVersion == "" {
					// Use default version if not specified (consistent with mcp_servers.go)
					mcpGatewayVersion = string(constants.DefaultMCPGatewayVersion)
				}
				image := buildVersionedImageRef(
					mcpGateway.Container,
					mcpGatewayVersion,
					string(constants.DefaultMCPGatewayVersion),
					constants.DefaultMCPGatewayDigest,
				)
				if !imageSet[image] {
					images = append(images, image)
					imageSet[image] = true
					dockerLog.Printf("Added sandbox.mcp container: %s", image)
				}
			}
		} else if sandboxDisabled {
			dockerLog.Print("Sandbox disabled, skipping MCP gateway container image")
		}
	}

	// Collect images from custom MCP tools with container configurations
	for toolName, toolValue := range tools {
		if mcpConfig, ok := toolValue.(map[string]any); ok {
			if hasMcp, _ := hasMCPConfig(mcpConfig); hasMcp {
				// Check if this tool uses a container
				if mcpConf, err := getMCPConfig(mcpConfig, toolName); err == nil {
					// Check for direct container field
					if mcpConf.Container != "" {
						image := mcpConf.Container
						if !imageSet[image] {
							images = append(images, image)
							imageSet[image] = true
						}
					} else if mcpConf.Command == "docker" && len(mcpConf.Args) > 0 {
						// Extract container image from docker args
						// Args format: ["run", "--rm", "-i", ... , "container-image"]
						// The container image is the last arg
						image := mcpConf.Args[len(mcpConf.Args)-1]
						// Skip if it's a docker flag (starts with -)
						if !strings.HasPrefix(image, "-") && !imageSet[image] {
							images = append(images, image)
							imageSet[image] = true
						}
					}
				}
			}
		}
	}

	// Sort for stable output
	sort.Strings(images)
	dockerLog.Printf("Collected %d Docker images from tools", len(images))
	return images
}

// generateDownloadDockerImagesStep generates the step to download Docker images
func generateDownloadDockerImagesStep(yaml *strings.Builder, dockerImages []string) {
	if len(dockerImages) == 0 {
		return
	}

	yaml.WriteString("      - name: Download container images\n")
	yaml.WriteString("        run: bash ${RUNNER_TEMP}/gh-aw/actions/download_docker_images.sh")
	for _, image := range dockerImages {
		fmt.Fprintf(yaml, " %s", image)
	}
	yaml.WriteString("\n")
}
