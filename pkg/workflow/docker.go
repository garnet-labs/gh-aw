package workflow

import (
	"fmt"
	"sort"
	"strings"

	"github.com/github/gh-aw/pkg/constants"
	"github.com/github/gh-aw/pkg/logger"
)

var dockerLog = logger.New("workflow:docker")

// buildVersionedImageRef constructs a Docker image reference, appending a SHA-256
// digest from the ContainerCache when available. When the cache has an entry for
// "container:version", the returned reference is "container:version@sha256:...",
// providing an immutable content address. For any image not present in the cache
// only "container:version" is returned (no digest).
func buildVersionedImageRef(container, version string, cache *ContainerCache) string {
	ref := container + ":" + version
	return lookupContainerDigest(ref, cache)
}

// baseImageRef returns the image reference with any @sha256: digest stripped.
// This is used for deduplication: "node:22-alpine@sha256:abc" and "node:22-alpine"
// are the same base image and should not both appear in the download list.
func baseImageRef(imageRef string) string {
	if base, _, ok := strings.Cut(imageRef, "@sha256:"); ok {
		return base
	}
	return imageRef
}

// collectDockerImages collects all Docker images used in MCP configurations.
// When cache is non-nil, each default image reference will have a @sha256: digest
// appended from the actions-lock.json file when one is available.
// Deduplication is done by base image reference (digest stripped), keeping the
// digest-pinned version when both a pinned and unpinned reference exist.
func collectDockerImages(tools map[string]any, workflowData *WorkflowData, actionMode ActionMode, cache *ContainerCache) []string {
	// imageSet maps base-ref → best-ref (with digest preferred over without)
	imageSet := make(map[string]string)

	// addImage adds or upgrades an image in the set.
	// If the base reference is already present and the new ref has a digest, it wins.
	addImage := func(imageRef string) {
		base := baseImageRef(imageRef)
		existing, found := imageSet[base]
		if !found {
			imageSet[base] = imageRef
			return
		}
		// Prefer the digest-pinned version
		if strings.Contains(imageRef, "@sha256:") && !strings.Contains(existing, "@sha256:") {
			imageSet[base] = imageRef
		}
	}

	// Check for GitHub tool (uses Docker image)
	if githubTool, hasGitHub := tools["github"]; hasGitHub {
		githubType := getGitHubType(githubTool)
		// Only add if using local (Docker) mode
		if githubType == "local" {
			githubDockerImageVersion := getGitHubDockerImageVersion(githubTool)
			addImage(buildVersionedImageRef(
				"ghcr.io/github/github-mcp-server",
				githubDockerImageVersion,
				cache,
			))
		}
	}

	// Check for Playwright tool (uses Docker image pinned to a versioned tag)
	if _, hasPlaywright := tools["playwright"]; hasPlaywright {
		addImage(lookupContainerDigest(
			"mcr.microsoft.com/playwright/mcp:"+string(constants.DefaultPlaywrightMCPDockerVersion),
			cache,
		))
	}

	// Check for safe-outputs MCP server (uses node Alpine container)
	if workflowData != nil && workflowData.SafeOutputs != nil && HasSafeOutputsEnabled(workflowData.SafeOutputs) {
		image := lookupContainerDigest(constants.DefaultNodeAlpineLTSImage, cache)
		addImage(image)
		dockerLog.Printf("Added safe-outputs MCP server container: %s", image)
	}

	// Check for agentic-workflows tool
	// In dev mode, the image is built locally in the workflow, so don't add to pull list
	// In release/script mode, use alpine which needs to be pulled
	if _, hasAgenticWorkflows := tools["agentic-workflows"]; hasAgenticWorkflows {
		if !actionMode.IsDev() {
			image := lookupContainerDigest(constants.DefaultAlpineImage, cache)
			addImage(image)
			dockerLog.Printf("Added agentic-workflows MCP server container: %s", image)
		}
		// Dev mode: localhost/gh-aw:dev is built locally, not pulled
	}

	// Collect AWF (firewall) container images when firewall is enabled
	// AWF uses three containers: squid (proxy), agent, and api-proxy (for engines with LLM gateway support)
	if isFirewallEnabled(workflowData) {
		// Get the firewall version for image tags
		firewallConfig := getFirewallConfig(workflowData)
		awfImageTag := getAWFImageTag(firewallConfig)

		// Add squid (proxy) container
		squidImage := buildVersionedImageRef(constants.DefaultFirewallRegistry+"/squid", awfImageTag, cache)
		addImage(squidImage)
		dockerLog.Printf("Added AWF squid (proxy) container: %s", squidImage)

		// Add default agent container
		agentImage := buildVersionedImageRef(constants.DefaultFirewallRegistry+"/agent", awfImageTag, cache)
		addImage(agentImage)
		dockerLog.Printf("Added AWF agent container: %s", agentImage)

		// Add api-proxy sidecar container (required for all engines — LLM gateway is mandatory)
		// The api-proxy holds LLM API keys securely and proxies requests through Squid
		// Each engine uses its own dedicated port for communication
		if workflowData != nil && workflowData.AI != "" {
			apiProxyImage := buildVersionedImageRef(constants.DefaultFirewallRegistry+"/api-proxy", awfImageTag, cache)
			addImage(apiProxyImage)
			dockerLog.Printf("Added AWF api-proxy sidecar container: %s", apiProxyImage)
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
					mcpGatewayVersion = string(constants.DefaultMCPGatewayVersion)
				}
				image := buildVersionedImageRef(mcpGateway.Container, mcpGatewayVersion, cache)
				addImage(image)
				dockerLog.Printf("Added sandbox.mcp container: %s", image)
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
						addImage(mcpConf.Container)
					} else if mcpConf.Command == "docker" && len(mcpConf.Args) > 0 {
						// Extract container image from docker args
						// Args format: ["run", "--rm", "-i", ... , "container-image"]
						// The container image is the last arg
						image := mcpConf.Args[len(mcpConf.Args)-1]
						// Skip if it's a docker flag (starts with -)
						if !strings.HasPrefix(image, "-") {
							addImage(image)
						}
					}
				}
			}
		}
	}

	// Collect best-version images (digest-pinned over plain) and sort for stable output
	images := make([]string, 0, len(imageSet))
	for _, ref := range imageSet {
		images = append(images, ref)
	}
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
