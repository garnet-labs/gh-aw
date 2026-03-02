//go:build !integration

package workflow

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestValidateReplayData(t *testing.T) {
	tests := []struct {
		name       string
		replayData *ReplayDataConfig
		wantErr    bool
		errSubstr  string
	}{
		{
			name:       "nil replay data is valid",
			replayData: nil,
			wantErr:    false,
		},
		{
			name: "valid safe-outputs with single item",
			replayData: &ReplayDataConfig{
				SafeOutputs: `[{"type": "add-comment", "body": "hello"}]`,
			},
			wantErr: false,
		},
		{
			name: "valid safe-outputs with multiple items",
			replayData: &ReplayDataConfig{
				SafeOutputs: `[{"type": "add-comment", "body": "hello"}, {"type": "create_pull_request", "patch_path": "/tmp/patch"}]`,
			},
			wantErr: false,
		},
		{
			name: "valid safe-outputs with patch-files",
			replayData: &ReplayDataConfig{
				SafeOutputs: `[{"type": "create_pull_request", "patch_path": "/tmp/pr.patch"}]`,
				PatchFiles:  `[{"patch_path": "/tmp/pr.patch", "contents": "diff --git a/file.txt b/file.txt\n"}]`,
			},
			wantErr: false,
		},
		{
			name: "empty safe-outputs",
			replayData: &ReplayDataConfig{
				SafeOutputs: "",
			},
			wantErr:   true,
			errSubstr: "safe-outputs is required",
		},
		{
			name: "safe-outputs is not valid JSON",
			replayData: &ReplayDataConfig{
				SafeOutputs: "not json",
			},
			wantErr:   true,
			errSubstr: "must be a valid JSON array",
		},
		{
			name: "safe-outputs is JSON object instead of array",
			replayData: &ReplayDataConfig{
				SafeOutputs: `{"type": "add-comment"}`,
			},
			wantErr:   true,
			errSubstr: "must be a valid JSON array",
		},
		{
			name: "safe-outputs is empty array",
			replayData: &ReplayDataConfig{
				SafeOutputs: `[]`,
			},
			wantErr:   true,
			errSubstr: "must contain at least one item",
		},
		{
			name: "safe-outputs item is not an object",
			replayData: &ReplayDataConfig{
				SafeOutputs: `["string-value"]`,
			},
			wantErr:   true,
			errSubstr: "must be a JSON object",
		},
		{
			name: "safe-outputs item missing type field",
			replayData: &ReplayDataConfig{
				SafeOutputs: `[{"body": "hello"}]`,
			},
			wantErr:   true,
			errSubstr: "must have a 'type' field",
		},
		{
			name: "invalid patch-files JSON",
			replayData: &ReplayDataConfig{
				SafeOutputs: `[{"type": "create_pull_request"}]`,
				PatchFiles:  "not json",
			},
			wantErr:   true,
			errSubstr: "patch-files must be a valid JSON array",
		},
		{
			name: "patch-files missing patch_path",
			replayData: &ReplayDataConfig{
				SafeOutputs: `[{"type": "create_pull_request"}]`,
				PatchFiles:  `[{"contents": "some patch"}]`,
			},
			wantErr:   true,
			errSubstr: "patch_path is required",
		},
		{
			name: "patch-files missing contents",
			replayData: &ReplayDataConfig{
				SafeOutputs: `[{"type": "create_pull_request"}]`,
				PatchFiles:  `[{"patch_path": "/tmp/pr.patch"}]`,
			},
			wantErr:   true,
			errSubstr: "contents is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateReplayData(tt.replayData)
			if tt.wantErr {
				require.Error(t, err, "expected validation error")
				assert.Contains(t, err.Error(), tt.errSubstr, "error should contain expected substring")
			} else {
				assert.NoError(t, err, "expected no validation error")
			}
		})
	}
}

func TestParseReplayPatchFiles(t *testing.T) {
	tests := []struct {
		name      string
		input     string
		wantLen   int
		wantErr   bool
		wantFirst *ReplayPatchFile
	}{
		{
			name:    "empty string returns nil",
			input:   "",
			wantLen: 0,
			wantErr: false,
		},
		{
			name:    "valid single patch file",
			input:   `[{"patch_path": "/tmp/pr.patch", "contents": "diff content"}]`,
			wantLen: 1,
			wantErr: false,
			wantFirst: &ReplayPatchFile{
				PatchPath: "/tmp/pr.patch",
				Contents:  "diff content",
			},
		},
		{
			name:    "valid multiple patch files",
			input:   `[{"patch_path": "/tmp/a.patch", "contents": "diff a"}, {"patch_path": "/tmp/b.patch", "contents": "diff b"}]`,
			wantLen: 2,
			wantErr: false,
			wantFirst: &ReplayPatchFile{
				PatchPath: "/tmp/a.patch",
				Contents:  "diff a",
			},
		},
		{
			name:    "invalid JSON",
			input:   "not json",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := ParseReplayPatchFiles(tt.input)
			if tt.wantErr {
				require.Error(t, err, "expected parse error")
				return
			}
			require.NoError(t, err, "expected no parse error")
			assert.Len(t, result, tt.wantLen, "unexpected number of patch files")
			if tt.wantFirst != nil && len(result) > 0 {
				assert.Equal(t, tt.wantFirst.PatchPath, result[0].PatchPath, "unexpected patch path")
				assert.Equal(t, tt.wantFirst.Contents, result[0].Contents, "unexpected patch contents")
			}
		})
	}
}

func TestExtractReplayDataConfig(t *testing.T) {
	tests := []struct {
		name        string
		frontmatter map[string]any
		wantNil     bool
		wantSafe    string
		wantPatch   string
	}{
		{
			name:        "no replay-data section",
			frontmatter: map[string]any{"engine": "copilot"},
			wantNil:     true,
		},
		{
			name: "replay-data with safe-outputs only",
			frontmatter: map[string]any{
				"replay-data": map[string]any{
					"safe-outputs": `[{"type": "add-comment", "body": "test"}]`,
				},
			},
			wantNil:  false,
			wantSafe: `[{"type": "add-comment", "body": "test"}]`,
		},
		{
			name: "replay-data with safe-outputs and patch-files",
			frontmatter: map[string]any{
				"replay-data": map[string]any{
					"safe-outputs": `[{"type": "create_pull_request"}]`,
					"patch-files":  `[{"patch_path": "/tmp/p.patch", "contents": "diff"}]`,
				},
			},
			wantNil:   false,
			wantSafe:  `[{"type": "create_pull_request"}]`,
			wantPatch: `[{"patch_path": "/tmp/p.patch", "contents": "diff"}]`,
		},
		{
			name: "replay-data is not a map",
			frontmatter: map[string]any{
				"replay-data": "not a map",
			},
			wantNil: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			compiler := NewCompiler()
			result := compiler.extractReplayDataConfig(tt.frontmatter)
			if tt.wantNil {
				assert.Nil(t, result, "expected nil replay data config")
				return
			}
			require.NotNil(t, result, "expected non-nil replay data config")
			assert.Equal(t, tt.wantSafe, result.SafeOutputs, "unexpected safe-outputs value")
			assert.Equal(t, tt.wantPatch, result.PatchFiles, "unexpected patch-files value")
		})
	}
}

func TestCompactJSON(t *testing.T) {
	tests := []struct {
		name    string
		input   json.RawMessage
		want    string
		wantErr bool
	}{
		{
			name:  "already compact",
			input: json.RawMessage(`{"type":"add-comment"}`),
			want:  `{"type":"add-comment"}`,
		},
		{
			name:  "with whitespace",
			input: json.RawMessage(`{  "type" : "add-comment" ,  "body" : "hello"  }`),
			want:  `{"type":"add-comment","body":"hello"}`,
		},
		{
			name:  "with newlines",
			input: json.RawMessage("{\n  \"type\": \"add-comment\"\n}"),
			want:  `{"type":"add-comment"}`,
		},
		{
			name:    "invalid JSON",
			input:   json.RawMessage(`{invalid`),
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := compactJSON(tt.input)
			if tt.wantErr {
				require.Error(t, err, "expected compact error")
				return
			}
			require.NoError(t, err, "expected no error")
			assert.Equal(t, tt.want, got, "unexpected compacted JSON")
		})
	}
}
