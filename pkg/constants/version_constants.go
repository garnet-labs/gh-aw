package constants

// Version represents a software version string.
// This semantic type distinguishes version strings from arbitrary strings,
// enabling future validation logic (e.g., semver parsing) and making
// version requirements explicit in function signatures.
//
// Example usage:
//
//	const DefaultCopilotVersion Version = "0.0.369"
//	func InstallTool(name string, version Version) error { ... }
type Version string

// String returns the string representation of the version
func (v Version) String() string {
	return string(v)
}

// IsValid returns true if the version is non-empty
func (v Version) IsValid() bool {
	return len(v) > 0
}

// ModelName represents an AI model name identifier.
// This semantic type distinguishes model names from arbitrary strings,
// making model selection explicit in function signatures.
//
// Example usage:
//
//	const DefaultCopilotDetectionModel ModelName = "gpt-5-mini"
//	func ExecuteWithModel(model ModelName) error { ... }
type ModelName string

// DefaultClaudeCodeVersion is the default version of the Claude Code CLI.
const DefaultClaudeCodeVersion Version = "latest"

// DefaultCopilotVersion is the default version of the GitHub Copilot CLI.
const DefaultCopilotVersion Version = "latest"

// DefaultCodexVersion is the default version of the OpenAI Codex CLI
const DefaultCodexVersion Version = "latest"

// DefaultGeminiVersion is the default version of the Google Gemini CLI
const DefaultGeminiVersion Version = "latest"

// DefaultGitHubMCPServerVersion is the default version of the GitHub MCP server Docker image
const DefaultGitHubMCPServerVersion Version = "v0.32.0"

// DefaultGitHubMCPServerDigest is the SHA-256 content digest for DefaultGitHubMCPServerVersion.
// This pins the image to an immutable content address, defending against tag mutation attacks.
// Must be updated whenever DefaultGitHubMCPServerVersion is bumped.
const DefaultGitHubMCPServerDigest = "sha256:2763823c63bcca718ce53850a1d7fcf2f501ec84028394f1b63ce7e9f4f9be28"

// DefaultFirewallVersion is the default version of the gh-aw-firewall (AWF) binary
const DefaultFirewallVersion Version = "v0.25.14"

// DefaultFirewallAgentDigest is the SHA-256 content digest for the AWF agent image at DefaultFirewallVersion.
// Must be updated whenever DefaultFirewallVersion is bumped.
const DefaultFirewallAgentDigest = "sha256:ca9a6136e3f642186564a1db82d991fe2b4702b94e9f97745956c8031ff74f62"

// DefaultFirewallAPIProxyDigest is the SHA-256 content digest for the AWF api-proxy image at DefaultFirewallVersion.
// Must be updated whenever DefaultFirewallVersion is bumped.
const DefaultFirewallAPIProxyDigest = "sha256:27f3143703c2cec9fd7e2eaff0fdf0b363e6773c75d23bb6b4439ea7c35a298a"

// DefaultFirewallSquidDigest is the SHA-256 content digest for the AWF squid image at DefaultFirewallVersion.
// Must be updated whenever DefaultFirewallVersion is bumped.
const DefaultFirewallSquidDigest = "sha256:4d77bc32827f4779852993b1174d98655ca9800adc173bb4703f29705892b3e9"

// AWFExcludeEnvMinVersion is the minimum AWF version that supports the --exclude-env flag.
// Workflows pinning an older AWF version must not emit --exclude-env flags or the run will fail.
const AWFExcludeEnvMinVersion Version = "v0.25.3"

// AWFCliProxyMinVersion is the minimum AWF version that supports the --enable-cli-proxy flag.
// Workflows pinning an older AWF version must not emit --enable-cli-proxy flags or the run will fail.
const AWFCliProxyMinVersion Version = "v0.25.14"

// DefaultMCPGatewayVersion is the default version of the MCP Gateway (gh-aw-mcpg) Docker image
const DefaultMCPGatewayVersion Version = "v0.2.15"

// DefaultMCPGatewayDigest is the SHA-256 content digest for DefaultMCPGatewayVersion.
// Must be updated whenever DefaultMCPGatewayVersion is bumped.
const DefaultMCPGatewayDigest = "sha256:9dbd57b16f8d79dfdeae347d025eadf972db6193c13d9e6a6ec569412a9e5002"

// DefaultPlaywrightMCPVersion is the default version of the @playwright/mcp package
const DefaultPlaywrightMCPVersion Version = "0.0.70"

// DefaultPlaywrightMCPDockerVersion is the default version tag for the mcr.microsoft.com/playwright/mcp Docker image.
// This version is separate from DefaultPlaywrightMCPVersion (npm package) because MCR and npm may use
// different version numbering or release cadences.
const DefaultPlaywrightMCPDockerVersion Version = "v0.0.68"

// DefaultPlaywrightMCPDockerDigest is the SHA-256 content digest for DefaultPlaywrightMCPDockerVersion.
// Must be updated whenever DefaultPlaywrightMCPDockerVersion is bumped.
const DefaultPlaywrightMCPDockerDigest = "sha256:a9d607e571d70954acc36de7a45e7f424a94cebdfba973b1f404435108c60f3f"

// DefaultPlaywrightBrowserVersion is the default version of the Playwright browser Docker image
const DefaultPlaywrightBrowserVersion Version = "v1.59.1"

// DefaultMCPSDKVersion is the default version of the @modelcontextprotocol/sdk package
const DefaultMCPSDKVersion Version = "1.24.0"

// DefaultGitHubScriptVersion is the default version of the actions/github-script action
const DefaultGitHubScriptVersion Version = "v8"

// DefaultBunVersion is the default version of Bun for runtime setup
const DefaultBunVersion Version = "1.1"

// DefaultNodeVersion is the default version of Node.js for runtime setup
const DefaultNodeVersion Version = "24"

// DefaultPythonVersion is the default version of Python for runtime setup
const DefaultPythonVersion Version = "3.12"

// DefaultRubyVersion is the default version of Ruby for runtime setup
const DefaultRubyVersion Version = "3.3"

// DefaultDotNetVersion is the default version of .NET for runtime setup
const DefaultDotNetVersion Version = "8.0"

// DefaultJavaVersion is the default version of Java for runtime setup
const DefaultJavaVersion Version = "21"

// DefaultElixirVersion is the default version of Elixir for runtime setup
const DefaultElixirVersion Version = "1.17"

// DefaultGoVersion is the default version of Go for runtime setup
const DefaultGoVersion Version = "1.25"

// DefaultHaskellVersion is the default version of GHC for runtime setup
const DefaultHaskellVersion Version = "9.10"

// DefaultDenoVersion is the default version of Deno for runtime setup
const DefaultDenoVersion Version = "2.x"
