package cli

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/github/gh-aw/pkg/console"
	"github.com/github/gh-aw/pkg/constants"
	"github.com/github/gh-aw/pkg/logger"
	"github.com/github/gh-aw/pkg/workflow"
)

var updateContainersLog = logger.New("cli:update_containers")

// containerImageSpec describes an image to resolve during UpdateContainers.
type containerImageSpec struct {
	image   string // registry + repository path, e.g. "ghcr.io/github/github-mcp-server"
	version string // tag, e.g. "v0.32.0"
}

// defaultContainerImages returns the list of container images whose digests should be
// tracked in containers-lock.json.  Any image referenced by the compiler as a default
// (non-user-overridable) image should appear here.
func defaultContainerImages() []containerImageSpec {
	awfTag := strings.TrimPrefix(string(constants.DefaultFirewallVersion), "v")
	return []containerImageSpec{
		// GitHub MCP server
		{
			image:   "ghcr.io/github/github-mcp-server",
			version: string(constants.DefaultGitHubMCPServerVersion),
		},
		// AWF firewall containers (three images, same version)
		{
			image:   constants.DefaultFirewallRegistry + "/agent",
			version: awfTag,
		},
		{
			image:   constants.DefaultFirewallRegistry + "/api-proxy",
			version: awfTag,
		},
		{
			image:   constants.DefaultFirewallRegistry + "/squid",
			version: awfTag,
		},
		// MCP Gateway
		{
			image:   constants.DefaultMCPGatewayContainer,
			version: string(constants.DefaultMCPGatewayVersion),
		},
		// Playwright MCP (MCR)
		{
			image:   "mcr.microsoft.com/playwright/mcp",
			version: string(constants.DefaultPlaywrightMCPDockerVersion),
		},
		// Base images used by the compiler (single-string constants split on last colon)
	}
}

// defaultBaseImages returns the floating-style image constants that are stored as "image:tag"
// single strings.
func defaultBaseImages() []string {
	return []string{
		constants.DefaultNodeAlpineLTSImage,
		constants.DefaultPythonAlpineLTSImage,
		constants.DefaultAlpineImage,
	}
}

// UpdateContainers resolves SHA-256 digests for all default container images and
// stores the results in .github/aw/containers-lock.json, analogous to how
// UpdateActions stores action SHAs in actions-lock.json.
//
// Digest resolution uses the OCI Distribution Specification registry HTTP API.
// GHCR images are authenticated with GITHUB_TOKEN (or $GH_TOKEN).
// Docker Hub and MCR images use anonymous access.
//
// Errors from individual image lookups are non-fatal; they are reported as warnings
// so that a single unreachable registry does not block the entire update.
func UpdateContainers(verbose bool) error {
	updateContainersLog.Print("Starting container image digest resolution")

	if verbose {
		fmt.Fprintln(os.Stderr, console.FormatInfoMessage("Resolving container image digests..."))
	}

	containerCache := workflow.NewContainerCache(".")
	if err := containerCache.Load(); err != nil {
		updateContainersLog.Printf("Warning: failed to load existing container cache: %v", err)
		// Continue with empty cache so we can still write fresh digests
	}

	var updatedImages []string
	var failedImages []string

	// Resolve digests for versioned images (image + separate version tag)
	for _, spec := range defaultContainerImages() {
		imageRef := spec.image + ":" + spec.version
		digest, err := resolveImageDigest(spec.image, spec.version)
		if err != nil {
			updateContainersLog.Printf("Warning: failed to resolve digest for %s: %v", imageRef, err)
			if verbose {
				fmt.Fprintln(os.Stderr, console.FormatWarningMessage(fmt.Sprintf("Failed to resolve %s: %v", imageRef, err)))
			}
			failedImages = append(failedImages, imageRef)
			continue
		}

		existing := containerCache.Entries[imageRef]
		if existing.Digest == digest {
			updateContainersLog.Printf("%s is already up to date (%s)", imageRef, digest[:min(16, len(digest))])
			continue
		}

		registry, _ := registryForImage(spec.image)
		containerCache.Set(imageRef, spec.image, spec.version, digest, registry)
		updatedImages = append(updatedImages, imageRef)
		fmt.Fprintln(os.Stderr, console.FormatSuccessMessage(fmt.Sprintf("Updated %s -> %s", imageRef, digest[:min(16, len(digest))]+"...")))
	}

	// Resolve digests for base images stored as full "image:tag" strings
	for _, imageRef := range defaultBaseImages() {
		image, version, ok := splitImageRef(imageRef)
		if !ok {
			updateContainersLog.Printf("Warning: cannot parse base image ref %q, skipping", imageRef)
			continue
		}

		digest, err := resolveImageDigest(image, version)
		if err != nil {
			updateContainersLog.Printf("Warning: failed to resolve digest for %s: %v", imageRef, err)
			if verbose {
				fmt.Fprintln(os.Stderr, console.FormatWarningMessage(fmt.Sprintf("Failed to resolve %s: %v", imageRef, err)))
			}
			failedImages = append(failedImages, imageRef)
			continue
		}

		existing := containerCache.Entries[imageRef]
		if existing.Digest == digest {
			updateContainersLog.Printf("%s is already up to date (%s)", imageRef, digest[:min(16, len(digest))])
			continue
		}

		registry, _ := registryForImage(image)
		containerCache.Set(imageRef, image, version, digest, registry)
		updatedImages = append(updatedImages, imageRef)
		fmt.Fprintln(os.Stderr, console.FormatSuccessMessage(fmt.Sprintf("Updated %s -> %s", imageRef, digest[:min(16, len(digest))]+"...")))
	}

	fmt.Fprintln(os.Stderr, "")

	if len(updatedImages) > 0 {
		if err := containerCache.Save(); err != nil {
			return fmt.Errorf("failed to save containers-lock.json: %w", err)
		}
		fmt.Fprintln(os.Stderr, console.FormatInfoMessage("Updated containers-lock.json file"))
	}

	if len(failedImages) > 0 {
		fmt.Fprintln(os.Stderr, console.FormatWarningMessage(fmt.Sprintf("Failed to resolve %d image(s):", len(failedImages))))
		for _, f := range failedImages {
			fmt.Fprintf(os.Stderr, "  %s\n", f)
		}
		fmt.Fprintln(os.Stderr, "")
	}

	return nil
}

// splitImageRef splits an image reference like "node:22-alpine" into ("node", "22-alpine").
func splitImageRef(imageRef string) (image, version string, ok bool) {
	idx := strings.LastIndex(imageRef, ":")
	if idx < 0 {
		return "", "", false
	}
	return imageRef[:idx], imageRef[idx+1:], true
}

// registryForImage returns the registry hostname and whether the image lives on GHCR.
func registryForImage(image string) (registry string, isGHCR bool) {
	switch {
	case strings.HasPrefix(image, "ghcr.io/"):
		return "ghcr.io", true
	case strings.HasPrefix(image, "mcr.microsoft.com/"):
		return "mcr.microsoft.com", false
	default:
		return "registry-1.docker.io", false
	}
}

// resolveImageDigest queries the OCI registry for the content digest of image:tag.
// The returned string has the form "sha256:<hex>".
func resolveImageDigest(image, tag string) (string, error) {
	registry, isGHCR := registryForImage(image)

	// Compute repository path relative to registry
	repoPath := image
	if isGHCR || strings.HasPrefix(image, "mcr.microsoft.com/") {
		// Strip "registry/" prefix to get the path within the registry
		repoPath = strings.TrimPrefix(image, registry+"/")
	} else {
		// Docker Hub: official images use "library/" prefix
		if !strings.Contains(image, "/") {
			repoPath = "library/" + image
		}
	}

	// Obtain an authentication token
	token, err := getRegistryToken(registry, repoPath, isGHCR)
	if err != nil {
		return "", fmt.Errorf("failed to obtain registry token for %s: %w", registry, err)
	}

	// Request manifest to get the content digest
	manifestURL := fmt.Sprintf("https://%s/v2/%s/manifests/%s", registry, repoPath, tag)
	digest, err := fetchManifestDigest(manifestURL, token)
	if err != nil {
		return "", fmt.Errorf("failed to fetch manifest for %s:%s: %w", image, tag, err)
	}
	return digest, nil
}

// getRegistryToken obtains a Bearer token for the given registry and repository.
func getRegistryToken(registry, repoPath string, isGHCR bool) (string, error) {
	switch registry {
	case "ghcr.io":
		// GHCR accepts a GitHub token encoded as base64 or as a Bearer token directly.
		// The anonymous token flow also works for public images but is rate-limited,
		// so prefer GITHUB_TOKEN when available.
		token := os.Getenv("GITHUB_TOKEN")
		if token == "" {
			token = os.Getenv("GH_TOKEN")
		}
		if token != "" {
			// GHCR accepts the raw PAT as Bearer for the auth endpoint
			authURL := fmt.Sprintf("https://ghcr.io/token?service=ghcr.io&scope=repository:%s:pull", repoPath)
			return fetchRegistryToken(authURL, token)
		}
		// Fall through to anonymous token
		authURL := fmt.Sprintf("https://ghcr.io/token?service=ghcr.io&scope=repository:%s:pull", repoPath)
		return fetchRegistryToken(authURL, "")

	case "registry-1.docker.io":
		authURL := fmt.Sprintf("https://auth.docker.io/token?service=registry.docker.io&scope=repository:%s:pull", repoPath)
		return fetchRegistryToken(authURL, "")

	case "mcr.microsoft.com":
		// MCR uses the standard OCI anonymous auth challenge flow
		authURL := fmt.Sprintf("https://mcr.microsoft.com/v2/%s/blobs", repoPath) // trigger 401 to discover realm
		return fetchMCRToken(authURL, repoPath)
	}

	return "", nil // Unknown registry; try without auth
}

// fetchRegistryToken retrieves a Bearer token from a Docker-compatible token endpoint.
// If tokenOverride is non-empty, it is used as the Basic auth credential (for GHCR PAT).
func fetchRegistryToken(authURL, tokenOverride string) (string, error) {
	req, err := http.NewRequest(http.MethodGet, authURL, nil)
	if err != nil {
		return "", err
	}
	if tokenOverride != "" {
		req.Header.Set("Authorization", "Bearer "+tokenOverride)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var tokenResp struct {
		Token       string `json:"token"`
		AccessToken string `json:"access_token"`
	}
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return "", fmt.Errorf("failed to parse token response: %w", err)
	}

	if tokenResp.Token != "" {
		return tokenResp.Token, nil
	}
	if tokenResp.AccessToken != "" {
		return tokenResp.AccessToken, nil
	}
	return "", errors.New("no token in registry response")
}

// fetchMCRToken handles MCR's two-step auth: first request triggers a 401 with a
// Www-Authenticate header pointing to the real token endpoint.
func fetchMCRToken(triggerURL, repoPath string) (string, error) {
	client := &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}
	resp, err := client.Get(triggerURL)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	wwwAuth := resp.Header.Get("Www-Authenticate")
	if wwwAuth == "" {
		// MCR public images sometimes don't require auth
		return "", nil
	}

	// Parse Bearer realm="...",service="...",scope="..."
	realm := extractAuthParam(wwwAuth, "realm")
	service := extractAuthParam(wwwAuth, "service")
	scope := extractAuthParam(wwwAuth, "scope")

	if realm == "" {
		return "", nil // No realm; try without auth
	}

	tokenURL := realm
	params := []string{}
	if service != "" {
		params = append(params, "service="+service)
	}
	if scope != "" {
		params = append(params, "scope="+scope)
	} else {
		params = append(params, "scope=repository:"+repoPath+":pull")
	}
	if len(params) > 0 {
		tokenURL += "?" + strings.Join(params, "&")
	}

	return fetchRegistryToken(tokenURL, "")
}

// extractAuthParam extracts a named parameter from a Www-Authenticate header value.
func extractAuthParam(header, key string) string {
	for part := range strings.SplitSeq(header, ",") {
		part = strings.TrimSpace(part)
		if val, ok := strings.CutPrefix(part, key+"="); ok {
			return strings.Trim(val, "\"")
		}
		// Handle "Bearer realm=..." at the start
		if rest, ok := strings.CutPrefix(part, "Bearer "); ok {
			for kv := range strings.SplitSeq(rest, " ") {
				kv = strings.TrimSpace(kv)
				if val, ok2 := strings.CutPrefix(kv, key+"="); ok2 {
					return strings.Trim(val, "\"")
				}
			}
		}
	}
	return ""
}

// fetchManifestDigest sends a GET request for a Docker manifest and returns the
// Docker-Content-Digest header value (the canonical content digest).
// It accepts both Docker and OCI manifest media types to support multi-arch indexes.
func fetchManifestDigest(manifestURL, token string) (string, error) {
	req, err := http.NewRequest(http.MethodGet, manifestURL, nil)
	if err != nil {
		return "", err
	}

	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	// Accept both single-arch manifests and multi-arch index manifests.
	// The registry returns the same Docker-Content-Digest regardless of which format
	// is accepted, so we prefer the index type to get a stable cross-arch digest.
	req.Header.Set("Accept", strings.Join([]string{
		"application/vnd.oci.image.index.v1+json",
		"application/vnd.docker.distribution.manifest.list.v2+json",
		"application/vnd.oci.image.manifest.v1+json",
		"application/vnd.docker.distribution.manifest.v2+json",
	}, ","))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("registry returned %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	digest := resp.Header.Get("Docker-Content-Digest")
	if digest == "" {
		return "", errors.New("registry did not return a Docker-Content-Digest header")
	}
	if !strings.HasPrefix(digest, "sha256:") {
		return "", fmt.Errorf("unexpected digest format: %s", digest)
	}
	return digest, nil
}
