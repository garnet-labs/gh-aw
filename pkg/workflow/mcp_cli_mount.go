package workflow

import (
	"fmt"
	"slices"
	"sort"
	"strings"
)

// mcp_cli_mount.go generates a workflow step that mounts MCP servers as local CLI tools
// and produces the prompt section that informs the agent about these tools.
//
// After the MCP gateway is started, this step runs mount_mcp_as_cli.cjs via
// actions/github-script which:
//   - Reads the CLI manifest saved by start_mcp_gateway.sh
//   - Queries each server for its tools/list via JSON-RPC
//   - Writes a standalone CLI wrapper script for each server to /tmp/gh-aw/mcp-cli/bin/
//   - Locks the bin directory (chmod 555) so the agent cannot modify the scripts
//   - Adds the directory to PATH via core.addPath()

// internalMCPServerNames lists the MCP servers that are internal infrastructure and
// should not be exposed as user-facing CLI tools.
var internalMCPServerNames = map[string]bool{
	"safeoutputs": true,
	"mcp-scripts": true,
}

// getMCPCLIServerNames returns the sorted list of MCP server names that will be
// mounted as CLI tools. It includes standard MCP tools (github, playwright, etc.)
// and custom MCP servers, but excludes internal infrastructure servers.
// Returns nil if tools.mount-as-clis is not set to true.
func getMCPCLIServerNames(data *WorkflowData) []string {
	if data == nil {
		return nil
	}

	// Only mount if tools.mount-as-clis: true is set.
	// Also returns nil when tools configuration is missing entirely.
	if data.ParsedTools == nil || !data.ParsedTools.MountAsCLIs {
		return nil
	}

	var servers []string

	// Collect user-facing standard MCP tools from the raw Tools map
	for toolName, toolValue := range data.Tools {
		if toolValue == false {
			continue
		}
		// Only include tools that have MCP servers (skip bash, web-fetch, web-search, edit, cache-memory, etc.)
		switch toolName {
		case "github", "playwright", "qmd", "agentic-workflows":
			servers = append(servers, toolName)
		default:
			// Include custom MCP servers (not in the internal list)
			if !internalMCPServerNames[toolName] {
				if mcpConfig, ok := toolValue.(map[string]any); ok {
					if hasMcp, _ := hasMCPConfig(mcpConfig); hasMcp {
						servers = append(servers, toolName)
					}
				}
			}
		}
	}

	// Also check ParsedTools.Custom for custom MCP servers
	if data.ParsedTools != nil {
		for name := range data.ParsedTools.Custom {
			if !internalMCPServerNames[name] && !slices.Contains(servers, name) {
				servers = append(servers, name)
			}
		}
	}

	sort.Strings(servers)
	return servers
}

// generateMCPCLIMountStep generates the "Mount MCP servers as CLIs" workflow step.
// This step runs after the MCP gateway is started and creates executable CLI wrapper
// scripts for each MCP server in a read-only directory on $PATH.
func (c *Compiler) generateMCPCLIMountStep(yaml *strings.Builder, data *WorkflowData) {
	servers := getMCPCLIServerNames(data)
	if len(servers) == 0 {
		return
	}

	yaml.WriteString("      - name: Mount MCP servers as CLIs\n")
	yaml.WriteString("        id: mount-mcp-clis\n")
	yaml.WriteString("        continue-on-error: true\n")
	yaml.WriteString("        env:\n")
	yaml.WriteString("          MCP_GATEWAY_API_KEY: ${{ steps.start-mcp-gateway.outputs.gateway-api-key }}\n")
	fmt.Fprintf(yaml, "        uses: %s\n", GetActionPin("actions/github-script"))
	yaml.WriteString("        with:\n")
	yaml.WriteString("          script: |\n")
	yaml.WriteString("            const { setupGlobals } = require('" + SetupActionDestination + "/setup_globals.cjs');\n")
	yaml.WriteString("            setupGlobals(core, github, context, exec, io);\n")
	yaml.WriteString("            const { main } = require('" + SetupActionDestination + "/mount_mcp_as_cli.cjs');\n")
	yaml.WriteString("            await main();\n")
}

// buildMCPCLIPromptSection returns a PromptSection describing the CLI tools available
// to the agent, or nil if there are no servers to mount.
func buildMCPCLIPromptSection(data *WorkflowData) *PromptSection {
	servers := getMCPCLIServerNames(data)
	if len(servers) == 0 {
		return nil
	}

	// Build the human-readable list of servers with example usage
	var listLines []string
	for _, name := range servers {
		listLines = append(listLines, fmt.Sprintf("- `%s` — run `%s --help` to see available tools", name, name))
	}
	serversList := strings.Join(listLines, "\n")

	// The prompt file uses a {MCP_CLI_SERVERS_LIST} placeholder; replace it inline
	content := strings.ReplaceAll(mcpCLIToolsPromptTemplate, "{MCP_CLI_SERVERS_LIST}", serversList)

	return &PromptSection{
		Content: content,
		IsFile:  false,
	}
}

// mcpCLIToolsPromptTemplate is the inline prompt template for MCP CLI tools.
// It uses the {MCP_CLI_SERVERS_LIST} placeholder which is replaced at compile time.
const mcpCLIToolsPromptTemplate = `<mcp-clis>
## MCP Tools Available as CLI Commands

The following MCP servers have been mounted as local CLI commands and are available directly from the shell:

{MCP_CLI_SERVERS_LIST}

### How to Use

Each server is a standalone command in your PATH. Use them like any other shell command:

` + "```bash" + `
# Show all available tools for a server
<server-name> --help

# Show help for a specific tool
<server-name> <tool-name> --help

# Call a tool with parameters
<server-name> <tool-name> --param1 value1 --param2 value2
` + "```" + `

### Notes

- Parameters are passed as ` + "`" + `--name value` + "`" + ` pairs (all values are treated as strings unless the tool accepts booleans, in which case ` + "`" + `--flag` + "`" + ` with no value sets it to ` + "`" + `true` + "`" + `)
- Results are printed to stdout; errors are printed to stderr
- The CLI scripts are read-only — use MCP tools via the CLI wrappers rather than calling the gateway directly
</mcp-clis>
`
