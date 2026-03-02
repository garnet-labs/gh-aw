//go:build !integration

package workflow

import (
	"strings"
	"testing"

	"github.com/github/gh-aw/pkg/constants"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestBuildReplayAgentJob(t *testing.T) {
	t.Run("returns error when ReplayData is nil", func(t *testing.T) {
		compiler := NewCompiler()
		data := &WorkflowData{
			ReplayData: nil,
		}
		job, err := compiler.buildReplayAgentJob(data, false)
		require.Error(t, err, "should error when replay data is nil")
		assert.Nil(t, job, "job should be nil on error")
		assert.Contains(t, err.Error(), "replay-data configuration is required", "error should mention missing replay data")
	})

	t.Run("returns error when ReplayData has invalid safe-outputs", func(t *testing.T) {
		compiler := NewCompiler()
		data := &WorkflowData{
			ReplayData: &ReplayDataConfig{
				SafeOutputs: "not valid json",
			},
		}
		job, err := compiler.buildReplayAgentJob(data, false)
		require.Error(t, err, "should error on invalid safe-outputs")
		assert.Nil(t, job, "job should be nil on error")
		assert.Contains(t, err.Error(), "invalid replay-data configuration", "error should mention invalid config")
	})

	t.Run("builds job with safe-outputs and activation dependency", func(t *testing.T) {
		compiler := NewCompiler()
		data := &WorkflowData{
			RunsOn: "ubuntu-latest",
			ReplayData: &ReplayDataConfig{
				SafeOutputs: `[{"type": "add-comment", "body": "replay comment"}]`,
			},
			SafeOutputs: &SafeOutputsConfig{},
		}
		job, err := compiler.buildReplayAgentJob(data, true)
		require.NoError(t, err, "should build replay job successfully")
		require.NotNil(t, job, "job should not be nil")

		assert.Equal(t, string(constants.AgentJobName), job.Name, "job name should be agent")
		assert.Contains(t, job.Needs, string(constants.ActivationJobName), "should depend on activation job")
		assert.Contains(t, job.Outputs, "output", "should have output key in outputs")
		assert.Contains(t, job.Outputs, "output_types", "should have output_types key in outputs")
		assert.Contains(t, job.Outputs, "has_patch", "should have has_patch key in outputs")
	})

	t.Run("builds job without activation dependency", func(t *testing.T) {
		compiler := NewCompiler()
		data := &WorkflowData{
			RunsOn: "ubuntu-latest",
			ReplayData: &ReplayDataConfig{
				SafeOutputs: `[{"type": "add-comment", "body": "test"}]`,
			},
			SafeOutputs: &SafeOutputsConfig{},
		}
		job, err := compiler.buildReplayAgentJob(data, false)
		require.NoError(t, err, "should build replay job successfully")
		require.NotNil(t, job, "job should not be nil")

		assert.Empty(t, job.Needs, "should not have dependencies when no activation")
	})

	t.Run("includes environment variables for safe-outputs", func(t *testing.T) {
		compiler := NewCompiler()
		data := &WorkflowData{
			RunsOn: "ubuntu-latest",
			ReplayData: &ReplayDataConfig{
				SafeOutputs: `[{"type": "add-comment", "body": "test"}]`,
			},
			SafeOutputs: &SafeOutputsConfig{},
		}
		job, err := compiler.buildReplayAgentJob(data, false)
		require.NoError(t, err, "should build replay job successfully")
		require.NotNil(t, job, "job should not be nil")

		assert.Contains(t, job.Env, "GH_AW_SAFE_OUTPUTS", "should have safe outputs env var")
		assert.Contains(t, job.Env, "GH_AW_SAFE_OUTPUTS_CONFIG_PATH", "should have config path env var")
		assert.Contains(t, job.Env, "GH_AW_SAFE_OUTPUTS_TOOLS_PATH", "should have tools path env var")
	})
}

func TestGenerateReplaySafeOutputsStep(t *testing.T) {
	t.Run("generates NDJSON writing steps", func(t *testing.T) {
		compiler := NewCompiler()
		replayData := &ReplayDataConfig{
			SafeOutputs: `[{"type": "add-comment", "body": "hello"}, {"type": "create_pull_request", "patch_path": "/tmp/pr.patch"}]`,
		}
		steps := compiler.generateReplaySafeOutputsStep(replayData)

		// Join all step strings to inspect the full content
		full := strings.Join(steps, "")

		assert.Contains(t, full, "Write replay safe-outputs", "should have step name")
		assert.Contains(t, full, "mkdir -p", "should create directory")
		assert.Contains(t, full, "REPLAY_SAFE_OUTPUT_EOF", "should use heredoc")
		assert.Contains(t, full, `"type":"add-comment"`, "should contain first safe output type")
		assert.Contains(t, full, `"type":"create_pull_request"`, "should contain second safe output type")
	})

	t.Run("handles single safe output", func(t *testing.T) {
		compiler := NewCompiler()
		replayData := &ReplayDataConfig{
			SafeOutputs: `[{"type": "add-comment", "body": "test"}]`,
		}
		steps := compiler.generateReplaySafeOutputsStep(replayData)
		full := strings.Join(steps, "")

		// Should have exactly one heredoc block
		count := strings.Count(full, "REPLAY_SAFE_OUTPUT_EOF")
		assert.Equal(t, 2, count, "should have exactly one heredoc (open + close)")
	})
}

func TestGenerateReplayPatchFilesSteps(t *testing.T) {
	t.Run("generates patch file writing steps", func(t *testing.T) {
		compiler := NewCompiler()
		replayData := &ReplayDataConfig{
			PatchFiles: `[{"patch_path": "/tmp/pr.patch", "contents": "diff --git a/file.txt b/file.txt\nindex abc..def 100644\n--- a/file.txt\n+++ b/file.txt\n@@ -1 +1 @@\n-old\n+new"}]`,
		}
		steps, err := compiler.generateReplayPatchFilesSteps(replayData)
		require.NoError(t, err, "should generate patch file steps")

		full := strings.Join(steps, "")
		assert.Contains(t, full, "Write replay patch file 1", "should have step name")
		assert.Contains(t, full, "/tmp/pr.patch", "should contain patch path")
		assert.Contains(t, full, "REPLAY_PATCH_EOF", "should use heredoc")
	})

	t.Run("generates multiple patch file steps", func(t *testing.T) {
		compiler := NewCompiler()
		replayData := &ReplayDataConfig{
			PatchFiles: `[{"patch_path": "/tmp/a.patch", "contents": "diff a"}, {"patch_path": "/tmp/b.patch", "contents": "diff b"}]`,
		}
		steps, err := compiler.generateReplayPatchFilesSteps(replayData)
		require.NoError(t, err, "should generate patch file steps")

		full := strings.Join(steps, "")
		assert.Contains(t, full, "Write replay patch file 1", "should have first step name")
		assert.Contains(t, full, "Write replay patch file 2", "should have second step name")
		assert.Contains(t, full, "/tmp/a.patch", "should contain first patch path")
		assert.Contains(t, full, "/tmp/b.patch", "should contain second patch path")
	})

	t.Run("returns error on invalid patch-files JSON", func(t *testing.T) {
		compiler := NewCompiler()
		replayData := &ReplayDataConfig{
			PatchFiles: "not valid json",
		}
		steps, err := compiler.generateReplayPatchFilesSteps(replayData)
		require.Error(t, err, "should error on invalid JSON")
		assert.Nil(t, steps, "steps should be nil on error")
	})
}
