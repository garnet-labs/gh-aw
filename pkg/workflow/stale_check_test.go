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

// TestStaleCheckInActivationJob tests that the frontmatter hash check step is correctly
// added or omitted based on the on.stale-check flag.
func TestStaleCheckInActivationJob(t *testing.T) {
	baseWorkflowMD := `---
engine: copilot
on:
  issues:
    types: [opened]
---
Test workflow for stale check step.
`
	disabledWorkflowMD := `---
engine: copilot
on:
  issues:
    types: [opened]
  stale-check: false
---
Test workflow for stale check step disabled.
`
	enabledExplicitWorkflowMD := `---
engine: copilot
on:
  issues:
    types: [opened]
  stale-check: true
---
Test workflow for stale check step explicitly enabled.
`

	tests := []struct {
		name       string
		workflowMD string
		wantStep   bool
	}{
		{
			name:       "step present when stale-check not set (default)",
			workflowMD: baseWorkflowMD,
			wantStep:   true,
		},
		{
			name:       "step absent when stale-check: false",
			workflowMD: disabledWorkflowMD,
			wantStep:   false,
		},
		{
			name:       "step present when stale-check: true explicitly",
			workflowMD: enabledExplicitWorkflowMD,
			wantStep:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tmpDir := testutil.TempDir(t, "stale-check-test")
			testFile := filepath.Join(tmpDir, "test-workflow.md")
			require.NoError(t, os.WriteFile(testFile, []byte(tt.workflowMD), 0644), "Should write workflow file")

			compiler := NewCompiler()
			err := compiler.CompileWorkflow(testFile)
			require.NoError(t, err, "Workflow should compile without errors")

			lockFile := stringutil.MarkdownToLockFile(testFile)
			lockContent, err := os.ReadFile(lockFile)
			require.NoError(t, err, "Lock file should be readable")
			lockStr := string(lockContent)

			hasStep := strings.Contains(lockStr, "Check workflow lock file")
			if tt.wantStep {
				assert.True(t, hasStep,
					"Expected 'Check workflow lock file' step in activation job but not found")
			} else {
				assert.False(t, hasStep,
					"Expected no 'Check workflow lock file' step in activation job but it was found")
			}
		})
	}
}

// TestStaleCheckNotEmittedInOnSection verifies that the internal on.stale-check flag is
// stripped from the compiled "on:" YAML block and never emitted into the final workflow.
// Emitting stale-check in "on:" produces invalid GitHub Actions YAML.
func TestStaleCheckNotEmittedInOnSection(t *testing.T) {
	tests := []struct {
		name       string
		workflowMD string
	}{
		{
			name: "stale-check: false not emitted when workflow_call trigger used",
			workflowMD: `---
engine: copilot
on:
  workflow_call:
  stale-check: false
---
Test reusable workflow.
`,
		},
		{
			name: "stale-check: true not emitted when issues trigger used",
			workflowMD: `---
engine: copilot
on:
  issues:
    types: [opened]
  stale-check: true
---
Test workflow.
`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tmpDir := testutil.TempDir(t, "stale-check-emit-test")
			testFile := filepath.Join(tmpDir, "test-workflow.md")
			require.NoError(t, os.WriteFile(testFile, []byte(tt.workflowMD), 0644), "Should write workflow file")

			compiler := NewCompiler()
			err := compiler.CompileWorkflow(testFile)
			require.NoError(t, err, "Workflow should compile without errors")

			lockFile := stringutil.MarkdownToLockFile(testFile)
			lockContent, err := os.ReadFile(lockFile)
			require.NoError(t, err, "Lock file should be readable")
			lockStr := string(lockContent)

			assert.NotContains(t, lockStr, "stale-check",
				"'stale-check' must not appear in the compiled lock file YAML")
		})
	}
}
