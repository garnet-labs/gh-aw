//go:build !integration

package workflow

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestBuildReplayCaptureSteps(t *testing.T) {
	steps := buildReplayCaptureSteps()

	// Should have multiple step lines
	require.NotEmpty(t, steps, "should generate replay capture steps")

	// Join all lines to check content
	content := strings.Join(steps, "")

	// Step 1: Capture replay data script
	assert.Contains(t, content, "name: Capture replay data", "should have capture step name")
	assert.Contains(t, content, "if: always()", "capture step should run always")
	assert.Contains(t, content, "continue-on-error: true", "capture step should continue on error")
	assert.Contains(t, content, "actions/github-script", "should use github-script action")
	assert.Contains(t, content, "script: |", "should have inline script")

	// Script content
	assert.Contains(t, content, "agent_output.json", "script should read agent output")
	assert.Contains(t, content, "replay-data:", "script should generate replay-data frontmatter")
	assert.Contains(t, content, "safe-outputs:", "script should include safe-outputs field")
	assert.Contains(t, content, "/tmp/gh-aw/replay-data.md", "script should write to replay-data.md")
	assert.Contains(t, content, "aw-.+\\.patch", "script should look for patch files")
	assert.Contains(t, content, "patch-files:", "script should include patch-files field")

	// Step 2: Upload replay data artifact
	assert.Contains(t, content, "name: Upload replay data", "should have upload step name")
	assert.Contains(t, content, "actions/upload-artifact", "should use upload-artifact action")
	assert.Contains(t, content, "name: replay-data", "artifact should be named replay-data")
	assert.Contains(t, content, "path: /tmp/gh-aw/replay-data.md", "should upload replay-data.md")
	assert.Contains(t, content, "if-no-files-found: ignore", "should ignore missing files")
}

func TestGetReplayCaptureScript(t *testing.T) {
	script := getReplayCaptureScript()

	assert.NotEmpty(t, script, "script should not be empty")

	// Check key logic in the script
	assert.Contains(t, script, "agent_output.json", "should read agent output file")
	assert.Contains(t, script, "agentOutput.items", "should extract items from agent output")
	assert.Contains(t, script, "JSON.stringify(items, null, 2)", "should serialize items as pretty-printed JSON")
	assert.Contains(t, script, "aw-.+\\.patch", "should look for aw-*.patch files")
	assert.Contains(t, script, "patch_path", "should include patch_path in output")
	assert.Contains(t, script, "patch-files: |", "should have patch-files as literal block")
	assert.Contains(t, script, "core.warning", "should warn on errors instead of failing")
	assert.Contains(t, script, "core.info", "should log info messages")

	// Verify it doesn't use console.log (should use core.info/core.warning)
	assert.NotContains(t, script, "console.log", "should not use console.log")
	assert.NotContains(t, script, "console.error", "should not use console.error")
}

func TestReplayCaptureStepsYAMLFormat(t *testing.T) {
	steps := buildReplayCaptureSteps()

	// Every line should end with \n for YAML formatting
	for i, step := range steps {
		assert.True(t, strings.HasSuffix(step, "\n"),
			"step line %d should end with newline: %q", i, step)
	}

	// Check proper YAML indentation (6 spaces for step-level, 8 for properties)
	content := strings.Join(steps, "")
	lines := strings.Split(content, "\n")
	for _, line := range lines {
		if strings.TrimSpace(line) == "" {
			continue
		}
		// Step names start with 6 spaces + "- name:"
		// Properties start with 8 spaces
		// Script content starts with 12 spaces
		trimmed := strings.TrimLeft(line, " ")
		indent := len(line) - len(trimmed)
		assert.True(t, indent >= 6,
			"line should have at least 6 spaces indent: %q (got %d)", line, indent)
	}
}
