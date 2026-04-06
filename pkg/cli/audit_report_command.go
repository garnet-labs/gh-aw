package cli

import (
	"github.com/github/gh-aw/pkg/constants"
	"github.com/spf13/cobra"
)

// NewAuditReportSubcommand creates the audit report subcommand for cross-run security audit reporting
func NewAuditReportSubcommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "report [workflow]",
		Short: "Generate a cross-run security and performance audit report",
		Long: `Generate a cross-run security and performance audit report across multiple recent workflow runs.

This command downloads artifacts for recent workflow runs and generates an aggregated security
and performance report showing trends, anomalies, and MCP server health across multiple runs.

The report includes:
- Firewall domain inventory and deny rate statistics
- Metrics trends (token usage, cost, duration, turns) with spike detection
- MCP server health and reliability across runs
- Error trends and anomaly detection
- Per-run firewall breakdowns

` + WorkflowIDExplanation + `

Examples:
  ` + string(constants.CLIExtensionPrefix) + ` audit report                                # Report for all workflows (last 10 runs)
  ` + string(constants.CLIExtensionPrefix) + ` audit report weekly-research                # Report for specific workflow
  ` + string(constants.CLIExtensionPrefix) + ` audit report weekly-research --last 20      # Report for last 20 runs
  ` + string(constants.CLIExtensionPrefix) + ` audit report --format markdown              # Markdown output for sharing
  ` + string(constants.CLIExtensionPrefix) + ` audit report --format pretty                # Console-formatted output
  ` + string(constants.CLIExtensionPrefix) + ` audit report --json                         # JSON output for CI integration
  ` + string(constants.CLIExtensionPrefix) + ` audit report --repo owner/repo              # Report for specific repository`,
		RunE: func(cmd *cobra.Command, args []string) error {
			var workflowName string
			if len(args) > 0 {
				workflowName = args[0]
			}

			count, _ := cmd.Flags().GetInt("count")
			if last, _ := cmd.Flags().GetInt("last"); last > 0 {
				count = last
			}
			format, _ := cmd.Flags().GetString("format")
			outputDir, _ := cmd.Flags().GetString("output")
			jsonOutput, _ := cmd.Flags().GetBool("json")
			repoOverride, _ := cmd.Flags().GetString("repo")

			return DownloadWorkflowLogs(
				cmd.Context(),
				workflowName,
				count,
				"", "", // startDate, endDate
				outputDir,
				"",   // engine
				"",   // ref
				0, 0, // beforeRunID, afterRunID
				repoOverride,
				false, // verbose
				false, // toolGraph
				false, // noStaged
				false, // firewallOnly
				false, // noFirewall
				false, // parse
				jsonOutput,
				0,     // timeout
				"",    // summaryFile: empty string disables summary file generation (avoids writing summary.json in report-only mode)
				"",    // safeOutputType
				false, // filteredIntegrity
				false, // train
				format,
			)
		},
	}

	addOutputFlag(cmd, defaultLogsOutputDir)
	addJSONFlag(cmd)
	addRepoFlag(cmd)
	cmd.Flags().IntP("count", "c", 10, "Maximum number of recent workflow runs to include in the report")
	cmd.Flags().Int("last", 0, "Alias for --count: number of recent runs to include in the report")
	cmd.Flags().String("format", "pretty", "Output format: pretty, markdown")

	return cmd
}
