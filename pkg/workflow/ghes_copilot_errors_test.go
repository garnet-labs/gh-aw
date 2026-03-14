//go:build !integration

package workflow

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/github/gh-aw/pkg/stringutil"
	"github.com/github/gh-aw/pkg/testutil"
)

// TestGHESErrorDetectionStep tests that a Copilot engine workflow includes
// the detect-ghes-errors step in the agent job.
func TestGHESErrorDetectionStep(t *testing.T) {
	testDir := testutil.TempDir(t, "test-ghes-error-*")
	workflowFile := filepath.Join(testDir, "test-workflow.md")

	workflow := `---
on: workflow_dispatch
engine: copilot
---

Test workflow`

	if err := os.WriteFile(workflowFile, []byte(workflow), 0644); err != nil {
		t.Fatalf("Failed to write test workflow: %v", err)
	}

	compiler := NewCompiler()
	if err := compiler.CompileWorkflow(workflowFile); err != nil {
		t.Fatalf("Failed to compile workflow: %v", err)
	}

	// Read the generated lock file
	lockFile := stringutil.MarkdownToLockFile(workflowFile)
	lockContent, err := os.ReadFile(lockFile)
	if err != nil {
		t.Fatalf("Failed to read lock file: %v", err)
	}

	lockStr := string(lockContent)

	// Check that agent job has detect-ghes-errors step
	if !strings.Contains(lockStr, "id: detect-ghes-errors") {
		t.Error("Expected agent job to have detect-ghes-errors step")
	}

	// Check that the detection step calls the shell script
	if !strings.Contains(lockStr, "bash /opt/gh-aw/actions/detect_ghes_copilot_errors.sh") {
		t.Error("Expected detect-ghes-errors step to call detect_ghes_copilot_errors.sh")
	}

	// Check that the agent job exposes all GHES error outputs
	ghesOutputs := []string{
		"ghes_token_exchange_403:",
		"ghes_model_loading_400:",
		"ghes_firewall_block:",
		"ghes_gh_cli_misconfigured:",
	}

	for _, output := range ghesOutputs {
		if !strings.Contains(lockStr, output) {
			t.Errorf("Expected agent job to have %s output", output)
		}
	}
}

// TestGHESErrorsInConclusionJob tests that the conclusion job receives the GHES error
// env vars when the Copilot engine is used.
func TestGHESErrorsInConclusionJob(t *testing.T) {
	testDir := testutil.TempDir(t, "test-ghes-error-conclusion-*")
	workflowFile := filepath.Join(testDir, "test-workflow.md")

	workflow := `---
on: workflow_dispatch
engine: copilot
safe-outputs:
  add-comment:
    max: 5
---

Test workflow`

	if err := os.WriteFile(workflowFile, []byte(workflow), 0644); err != nil {
		t.Fatalf("Failed to write test workflow: %v", err)
	}

	compiler := NewCompiler()
	if err := compiler.CompileWorkflow(workflowFile); err != nil {
		t.Fatalf("Failed to compile workflow: %v", err)
	}

	// Read the generated lock file
	lockFile := stringutil.MarkdownToLockFile(workflowFile)
	lockContent, err := os.ReadFile(lockFile)
	if err != nil {
		t.Fatalf("Failed to read lock file: %v", err)
	}

	lockStr := string(lockContent)

	// Check that conclusion job receives all GHES error outputs from agent job
	ghesEnvVars := []string{
		"GH_AW_GHES_TOKEN_EXCHANGE_403:",
		"GH_AW_GHES_MODEL_LOADING_400:",
		"GH_AW_GHES_FIREWALL_BLOCK:",
		"GH_AW_GHES_GH_CLI_MISCONFIGURED:",
	}

	for _, envVar := range ghesEnvVars {
		if !strings.Contains(lockStr, envVar) {
			t.Errorf("Expected conclusion job to receive %s from agent job", envVar)
		}
	}
}

// TestGHESErrorsNotInNonCopilotEngine tests that non-Copilot engines
// do NOT include the detect-ghes-errors step.
func TestGHESErrorsNotInNonCopilotEngine(t *testing.T) {
	testDir := testutil.TempDir(t, "test-ghes-error-claude-*")
	workflowFile := filepath.Join(testDir, "test-workflow.md")

	workflow := `---
on: workflow_dispatch
engine: claude
---

Test workflow`

	if err := os.WriteFile(workflowFile, []byte(workflow), 0644); err != nil {
		t.Fatalf("Failed to write test workflow: %v", err)
	}

	compiler := NewCompiler()
	if err := compiler.CompileWorkflow(workflowFile); err != nil {
		t.Fatalf("Failed to compile workflow: %v", err)
	}

	// Read the generated lock file
	lockFile := stringutil.MarkdownToLockFile(workflowFile)
	lockContent, err := os.ReadFile(lockFile)
	if err != nil {
		t.Fatalf("Failed to read lock file: %v", err)
	}

	lockStr := string(lockContent)

	// Check that non-Copilot engines do NOT have the detect-ghes-errors step
	if strings.Contains(lockStr, "id: detect-ghes-errors") {
		t.Error("Expected non-Copilot engine to NOT have detect-ghes-errors step")
	}

	// Check that non-Copilot engines do NOT have the GHES error outputs
	ghesOutputs := []string{
		"ghes_token_exchange_403:",
		"ghes_model_loading_400:",
		"ghes_firewall_block:",
		"ghes_gh_cli_misconfigured:",
	}

	for _, output := range ghesOutputs {
		if strings.Contains(lockStr, output) {
			t.Errorf("Expected non-Copilot engine to NOT have %s output", output)
		}
	}
}
