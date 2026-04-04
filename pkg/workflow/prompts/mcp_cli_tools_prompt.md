## MCP Tools Available as CLI Commands

The following MCP servers have been mounted as local CLI commands and are available directly from the shell:

{MCP_CLI_SERVERS_LIST}

### How to Use

Each server is a standalone command in your PATH. Use them like any other shell command:

```bash
# Show all available tools for a server
<server-name> --help

# Show help for a specific tool
<server-name> <tool-name> --help

# Call a tool with parameters
<server-name> <tool-name> --param1 value1 --param2 value2
```

### Notes

- Parameters are passed as `--name value` pairs (all values are treated as strings unless the tool accepts booleans, in which case `--flag` with no value sets it to `true`)
- Results are printed to stdout; errors are printed to stderr
- The CLI scripts are read-only — use MCP tools via the CLI wrappers rather than calling the gateway directly
