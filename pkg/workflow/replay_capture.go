package workflow

import (
	"fmt"

	"github.com/github/gh-aw/pkg/logger"
)

var replayCaptureLog = logger.New("workflow:replay_capture")

// buildReplayCaptureSteps creates steps that capture the workflow's safe output items
// as a replay-data.md artifact. This artifact can be pasted back into a workflow's
// frontmatter to replay the same safe outputs without running the agent.
//
// The steps are:
// 1. A github-script step that reads agent_output.json and generates replay-data.md
// 2. An upload-artifact step that uploads replay-data.md (continue-on-error: true)
//
// Both steps use if: always() and continue-on-error: true so they never fail the workflow.
func buildReplayCaptureSteps() []string {
	replayCaptureLog.Print("Building replay data capture steps")

	var steps []string

	// Step 1: Generate replay-data.md using inline JavaScript
	steps = append(steps, "      - name: Capture replay data\n")
	steps = append(steps, "        if: always()\n")
	steps = append(steps, "        continue-on-error: true\n")
	steps = append(steps, fmt.Sprintf("        uses: %s\n", GetActionPin("actions/github-script")))
	steps = append(steps, "        with:\n")
	steps = append(steps, "          script: |\n")

	// Inline JavaScript that reads agent_output.json and generates replay-data.md
	script := getReplayCaptureScript()
	formattedScript := FormatJavaScriptForYAML(script)
	steps = append(steps, formattedScript...)

	// Step 2: Upload replay-data.md as artifact
	steps = append(steps, "      - name: Upload replay data\n")
	steps = append(steps, "        if: always()\n")
	steps = append(steps, "        continue-on-error: true\n")
	steps = append(steps, fmt.Sprintf("        uses: %s\n", GetActionPin("actions/upload-artifact")))
	steps = append(steps, "        with:\n")
	steps = append(steps, "          name: replay-data\n")
	steps = append(steps, "          path: /tmp/gh-aw/replay-data.md\n")
	steps = append(steps, "          if-no-files-found: ignore\n")

	replayCaptureLog.Print("Replay data capture steps built successfully")

	return steps
}

// getReplayCaptureScript returns the inline JavaScript that reads agent_output.json
// and patch files, then generates a replay-data.md file with proper frontmatter format.
// The generated file includes:
//   - safe-outputs: pretty-printed JSON array of safe output items
//   - patch-files: (if any aw-*.patch files exist) pretty-printed JSON array of
//     {patch_path, contents} objects
func getReplayCaptureScript() string {
	return `const fs = require('fs');
const path = '/tmp/gh-aw/safeoutputs/agent_output.json';
try {
  if (!fs.existsSync(path)) {
    core.info('No agent output found at ' + path + ', skipping replay data capture');
    return;
  }
  const raw = fs.readFileSync(path, 'utf8');
  const agentOutput = JSON.parse(raw);
  const items = agentOutput.items || [];
  if (items.length === 0) {
    core.info('No safe output items found, skipping replay data capture');
    return;
  }
  const indent = (json) => json.split('\n').map(l => '    ' + l).join('\n');
  const safeOutputsJson = JSON.stringify(items, null, 2);
  const lines = [
    '---',
    'replay-data:',
    '  safe-outputs: |',
    indent(safeOutputsJson),
  ];
  const patchDir = '/tmp/gh-aw';
  const patchFiles = [];
  try {
    const entries = fs.readdirSync(patchDir);
    for (const entry of entries) {
      if (/^aw-.+\.patch$/.test(entry)) {
        const contents = fs.readFileSync(patchDir + '/' + entry, 'utf8');
        patchFiles.push({ patch_path: patchDir + '/' + entry, contents });
      }
    }
  } catch (e) {
    core.info('Could not read patch directory: ' + e.message);
  }
  if (patchFiles.length > 0) {
    core.info('Found ' + patchFiles.length + ' patch file(s)');
    const patchJson = JSON.stringify(patchFiles, null, 2);
    lines.push('  patch-files: |');
    lines.push(indent(patchJson));
  }
  lines.push('---');
  lines.push('');
  const md = lines.join('\n');
  const outputPath = '/tmp/gh-aw/replay-data.md';
  fs.writeFileSync(outputPath, md, 'utf8');
  core.info('Replay data written to ' + outputPath + ' with ' + items.length + ' items');
} catch (err) {
  core.warning('Failed to capture replay data: ' + err.message);
}`
}
