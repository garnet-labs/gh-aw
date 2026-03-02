package workflow

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/github/gh-aw/pkg/constants"
	"github.com/github/gh-aw/pkg/logger"
)

var compilerReplayJobLog = logger.New("workflow:compiler_replay_job")

// buildReplayAgentJob creates a replay agent job that writes predefined safe-outputs and patch files
// instead of running the AI engine. This is used for testing the safe-outputs pipeline.
func (c *Compiler) buildReplayAgentJob(data *WorkflowData, activationJobCreated bool) (*Job, error) {
	compilerReplayJobLog.Print("Building replay agent job from replay-data configuration")

	if data.ReplayData == nil {
		return nil, fmt.Errorf("replay-data configuration is required when --replay is enabled")
	}

	// Validate replay data
	if err := ValidateReplayData(data.ReplayData); err != nil {
		return nil, fmt.Errorf("invalid replay-data configuration: %w", err)
	}

	var steps []string

	// Add setup action steps at the beginning of the job (same as normal agent job)
	setupActionRef := c.resolveActionReference("./actions/setup", data)
	if setupActionRef != "" || c.actionMode.IsScript() {
		steps = append(steps, c.generateCheckoutActionsFolder(data)...)
		steps = append(steps, c.generateSetupStep(setupActionRef, SetupActionDestination, false)...)
	}

	// Generate step to write replay safe-outputs to the JSONL file
	steps = append(steps, c.generateReplaySafeOutputsStep(data.ReplayData)...)

	// Generate steps to write replay patch files
	if data.ReplayData.PatchFiles != "" {
		patchSteps, err := c.generateReplayPatchFilesSteps(data.ReplayData)
		if err != nil {
			return nil, fmt.Errorf("failed to generate replay patch file steps: %w", err)
		}
		steps = append(steps, patchSteps...)
	}

	// Add output collection step (same as normal agent job) to set job outputs
	if data.SafeOutputs != nil {
		var yaml strings.Builder
		c.generateOutputCollectionStep(&yaml, data)
		steps = append(steps, yaml.String())
	}

	// Build dependencies (same logic as normal agent job)
	var depends []string
	if activationJobCreated {
		depends = []string{string(constants.ActivationJobName)}
	}

	// Build outputs (same as normal agent job)
	outputs := map[string]string{
		"model": "${{ needs.activation.outputs.model }}",
	}

	if data.SafeOutputs != nil {
		outputs["output"] = "${{ steps.collect_output.outputs.output }}"
		outputs["output_types"] = "${{ steps.collect_output.outputs.output_types }}"
		outputs["has_patch"] = "${{ steps.collect_output.outputs.has_patch }}"
	}

	// Build job-level environment variables (same as normal agent job)
	var env map[string]string
	if data.SafeOutputs != nil {
		env = make(map[string]string)
		env["GH_AW_SAFE_OUTPUTS"] = "/opt/gh-aw/safeoutputs/outputs.jsonl"
		env["GH_AW_MCP_LOG_DIR"] = "/tmp/gh-aw/mcp-logs/safeoutputs"
		env["GH_AW_SAFE_OUTPUTS_CONFIG_PATH"] = "/opt/gh-aw/safeoutputs/config.json"
		env["GH_AW_SAFE_OUTPUTS_TOOLS_PATH"] = "/opt/gh-aw/safeoutputs/tools.json"
		if data.SafeOutputs.UploadAssets != nil {
			env["GH_AW_ASSETS_BRANCH"] = fmt.Sprintf("%q", data.SafeOutputs.UploadAssets.BranchName)
			env["GH_AW_ASSETS_MAX_SIZE_KB"] = fmt.Sprintf("%d", data.SafeOutputs.UploadAssets.MaxSizeKB)
			env["GH_AW_ASSETS_ALLOWED_EXTS"] = fmt.Sprintf("%q", strings.Join(data.SafeOutputs.UploadAssets.AllowedExts, ","))
		} else {
			env["GH_AW_ASSETS_BRANCH"] = `""`
			env["GH_AW_ASSETS_MAX_SIZE_KB"] = "0"
			env["GH_AW_ASSETS_ALLOWED_EXTS"] = `""`
		}
		env["DEFAULT_BRANCH"] = "${{ github.event.repository.default_branch }}"
	}

	job := &Job{
		Name:    string(constants.AgentJobName),
		RunsOn:  c.indentYAMLLines(data.RunsOn, "    "),
		Env:     env,
		Steps:   steps,
		Needs:   depends,
		Outputs: outputs,
	}

	compilerReplayJobLog.Print("Successfully built replay agent job")
	return job, nil
}

// generateReplaySafeOutputsStep generates steps that write replay safe-outputs to the JSONL file.
// Each safe output object is written as a separate line in NDJSON format.
func (c *Compiler) generateReplaySafeOutputsStep(replayData *ReplayDataConfig) []string {
	compilerReplayJobLog.Print("Generating replay safe-outputs writing step")

	var steps []string

	// Parse the safe-outputs JSON array
	var safeOutputs []json.RawMessage
	if err := json.Unmarshal([]byte(replayData.SafeOutputs), &safeOutputs); err != nil {
		// Validation should have caught this; but be defensive
		compilerReplayJobLog.Printf("Warning: failed to parse replay safe-outputs: %v", err)
		return steps
	}

	// Create the directory and write each safe output as a JSONL line
	steps = append(steps, "      - name: Write replay safe-outputs\n")
	steps = append(steps, "        shell: bash\n")
	steps = append(steps, "        run: |\n")
	steps = append(steps, "          # Create directory for safe outputs\n")
	steps = append(steps, "          mkdir -p \"$(dirname \"$GH_AW_SAFE_OUTPUTS\")\"\n")
	steps = append(steps, "          # Write replay safe-outputs as NDJSON (one JSON object per line)\n")

	for _, item := range safeOutputs {
		// Compact the JSON to a single line for NDJSON format
		compacted, err := compactJSON(item)
		if err != nil {
			compilerReplayJobLog.Printf("Warning: failed to compact JSON: %v", err)
			continue
		}
		// Use heredoc to write each line to avoid shell escaping issues
		steps = append(steps, fmt.Sprintf("          cat >> \"$GH_AW_SAFE_OUTPUTS\" <<'REPLAY_SAFE_OUTPUT_EOF'\n"))
		steps = append(steps, fmt.Sprintf("          %s\n", compacted))
		steps = append(steps, "          REPLAY_SAFE_OUTPUT_EOF\n")
	}

	return steps
}

// generateReplayPatchFilesSteps generates steps that write replay patch files to their specified paths.
func (c *Compiler) generateReplayPatchFilesSteps(replayData *ReplayDataConfig) ([]string, error) {
	compilerReplayJobLog.Print("Generating replay patch files writing steps")

	patchFiles, err := ParseReplayPatchFiles(replayData.PatchFiles)
	if err != nil {
		return nil, err
	}

	var steps []string

	for i, pf := range patchFiles {
		steps = append(steps, fmt.Sprintf("      - name: Write replay patch file %d\n", i+1))
		steps = append(steps, "        shell: bash\n")
		steps = append(steps, "        run: |\n")
		steps = append(steps, fmt.Sprintf("          mkdir -p \"$(dirname '%s')\"\n", pf.PatchPath))
		steps = append(steps, fmt.Sprintf("          cat > '%s' <<'REPLAY_PATCH_EOF'\n", pf.PatchPath))
		steps = append(steps, fmt.Sprintf("          %s\n", pf.Contents))
		steps = append(steps, "          REPLAY_PATCH_EOF\n")
	}

	return steps, nil
}

// compactJSON compacts a JSON raw message into a single line.
func compactJSON(raw json.RawMessage) (string, error) {
	var buf bytes.Buffer
	if err := json.Compact(&buf, raw); err != nil {
		return "", err
	}
	return buf.String(), nil
}
