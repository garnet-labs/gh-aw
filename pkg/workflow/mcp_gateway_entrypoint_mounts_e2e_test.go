//go:build !integration

package workflow

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/github/gh-aw/pkg/stringutil"
	"github.com/github/gh-aw/pkg/testutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestMCPGatewayEntrypointE2E tests end-to-end compilation with entrypoint configuration
func TestMCPGatewayEntrypointE2E(t *testing.T) {
	markdown := `---
on: workflow_dispatch
engine: copilot
sandbox:
  mcp:
    container: ghcr.io/github/gh-aw-mcpg
    entrypoint: /custom/start.sh
    entrypointArgs:
      - --verbose
      - --port
      - "8080"
---

# Test Workflow

Test that entrypoint is properly extracted and included in the compiled workflow.
`

	// Create temporary directory and file
	tmpDir := testutil.TempDir(t, "entrypoint-test")
	testFile := filepath.Join(tmpDir, "test-entrypoint.md")
	err := os.WriteFile(testFile, []byte(markdown), 0644)
	require.NoError(t, err, "Failed to write test file")

	// Compile the workflow
	compiler := NewCompiler()
	err = compiler.CompileWorkflow(testFile)
	require.NoError(t, err, "Compilation should succeed")

	// Read the generated lock file
	lockFile := stringutil.MarkdownToLockFile(testFile)
	result, err := os.ReadFile(lockFile)
	require.NoError(t, err, "Failed to read lock file")
	require.NotEmpty(t, result, "Compiled YAML should not be empty")

	// Convert to string for easier searching
	yamlStr := string(result)

	// Verify the entrypoint flag is in the docker command
	assert.Contains(t, yamlStr, "--entrypoint", "Compiled YAML should contain --entrypoint flag")
	assert.Contains(t, yamlStr, "/custom/start.sh", "Compiled YAML should contain entrypoint value")

	// Verify entrypoint args are present
	assert.Contains(t, yamlStr, "--verbose", "Compiled YAML should contain entrypoint arg --verbose")
	assert.Contains(t, yamlStr, "--port", "Compiled YAML should contain entrypoint arg --port")
	assert.Contains(t, yamlStr, "8080", "Compiled YAML should contain entrypoint arg value 8080")

	// Verify all elements are present (ordering can vary due to multiple mentions of container)
	assert.Positive(t, strings.Index(yamlStr, "--entrypoint"), "Entrypoint flag should be in YAML")
	assert.Positive(t, strings.Index(yamlStr, "/custom/start.sh"), "Entrypoint value should be in YAML")
	assert.Positive(t, strings.Index(yamlStr, "ghcr.io/github/gh-aw-mcpg"), "Container should be in YAML")
}

// TestMCPGatewayEntrypointAndMountsE2E tests end-to-end compilation with entrypoint configuration
func TestMCPGatewayEntrypointAndMountsE2E(t *testing.T) {
	markdown := `---
on: workflow_dispatch
engine: copilot
sandbox:
  mcp:
    container: ghcr.io/github/gh-aw-mcpg
    entrypoint: /bin/bash
    entrypointArgs:
      - -c
      - "exec /app/start.sh"
---

# Test Workflow

Test that entrypoint is properly extracted and included in the compiled workflow.
`

	// Create temporary directory and file
	tmpDir := testutil.TempDir(t, "combined-test")
	testFile := filepath.Join(tmpDir, "test-combined.md")
	err := os.WriteFile(testFile, []byte(markdown), 0644)
	require.NoError(t, err, "Failed to write test file")

	// Compile the workflow
	compiler := NewCompiler()
	err = compiler.CompileWorkflow(testFile)
	require.NoError(t, err, "Compilation should succeed")

	// Read the generated lock file
	lockFile := stringutil.MarkdownToLockFile(testFile)
	result, err := os.ReadFile(lockFile)
	require.NoError(t, err, "Failed to read lock file")
	require.NotEmpty(t, result, "Compiled YAML should not be empty")

	// Convert to string for easier searching
	yamlStr := string(result)

	// Verify entrypoint is present
	assert.Contains(t, yamlStr, "--entrypoint", "Compiled YAML should contain --entrypoint flag")
	assert.Contains(t, yamlStr, "/bin/bash", "Compiled YAML should contain entrypoint value")

	// Verify entrypoint args are present
	assert.Contains(t, yamlStr, "-c", "Compiled YAML should contain entrypoint arg -c")
	assert.Contains(t, yamlStr, "exec /app/start.sh", "Compiled YAML should contain entrypoint command")

	assert.Positive(t, strings.Index(yamlStr, "--entrypoint"), "Entrypoint should be in the YAML")
	assert.Positive(t, strings.Index(yamlStr, "ghcr.io/github/gh-aw-mcpg"), "Container should be in the YAML")
}

// TestMCPGatewayWithoutEntrypointOrMountsE2E tests that workflows without these fields compile correctly
func TestMCPGatewayWithoutEntrypointOrMountsE2E(t *testing.T) {
	markdown := `---
on: workflow_dispatch
engine: copilot
---

# Test Workflow

Test that workflows without entrypoint or mounts still compile correctly.
`

	// Create temporary directory and file
	tmpDir := testutil.TempDir(t, "default-test")
	testFile := filepath.Join(tmpDir, "test-default.md")
	err := os.WriteFile(testFile, []byte(markdown), 0644)
	require.NoError(t, err, "Failed to write test file")

	// Compile the workflow
	compiler := NewCompiler()
	err = compiler.CompileWorkflow(testFile)
	require.NoError(t, err, "Compilation should succeed")

	// Read the generated lock file
	lockFile := stringutil.MarkdownToLockFile(testFile)
	result, err := os.ReadFile(lockFile)
	require.NoError(t, err, "Failed to read lock file")
	require.NotEmpty(t, result, "Compiled YAML should not be empty")

	// Convert to string for easier searching
	yamlStr := string(result)

	// Should still have the MCP gateway setup but without custom entrypoint
	// The default container should be present
	assert.Contains(t, yamlStr, "ghcr.io/github/gh-aw-mcpg", "Compiled YAML should contain default container")
}

// TestMCPGatewayEntrypointWithSpecialCharacters tests entrypoint with special characters
func TestMCPGatewayEntrypointWithSpecialCharacters(t *testing.T) {
	markdown := `---
on: workflow_dispatch
engine: copilot
sandbox:
  mcp:
    container: ghcr.io/github/gh-aw-mcpg
    entrypoint: /usr/bin/env
    entrypointArgs:
      - bash
      - -c
      - "echo 'Hello World' && /app/start.sh"
---

# Test Workflow

Test that entrypoint with special characters in args is properly handled.
`

	// Create temporary directory and file
	tmpDir := testutil.TempDir(t, "special-chars-test")
	testFile := filepath.Join(tmpDir, "test-special-chars.md")
	err := os.WriteFile(testFile, []byte(markdown), 0644)
	require.NoError(t, err, "Failed to write test file")

	// Compile the workflow
	compiler := NewCompiler()
	err = compiler.CompileWorkflow(testFile)
	require.NoError(t, err, "Compilation should succeed")

	// Read the generated lock file
	lockFile := stringutil.MarkdownToLockFile(testFile)
	result, err := os.ReadFile(lockFile)
	require.NoError(t, err, "Failed to read lock file")
	require.NotEmpty(t, result, "Compiled YAML should not be empty")

	// Convert to string for easier searching
	yamlStr := string(result)

	// Verify entrypoint is present
	assert.Contains(t, yamlStr, "--entrypoint", "Compiled YAML should contain --entrypoint flag")
	assert.Contains(t, yamlStr, "/usr/bin/env", "Compiled YAML should contain entrypoint value")

	// Verify args with special characters are properly handled
	assert.Contains(t, yamlStr, "bash", "Compiled YAML should contain bash arg")
	// The exact format of the shell-quoted command may vary, but it should contain the key parts
	assert.True(t, strings.Contains(yamlStr, "Hello World") || strings.Contains(yamlStr, "Hello\\ World"),
		"Compiled YAML should contain the command string (possibly escaped)")
}
