package workflow

import (
	"encoding/json"
	"fmt"

	"github.com/github/gh-aw/pkg/logger"
)

var replayDataLog = logger.New("workflow:replay_data")

// ReplayDataConfig holds replay data configuration for testing workflows without running the AI agent.
// When --replay is passed to compile, the agent job is replaced with a simple job
// that writes the replay safe-outputs and patch files instead of invoking the AI engine.
type ReplayDataConfig struct {
	// SafeOutputs is a JSON string containing an array of safe output objects.
	// Each object represents a replay safe output result (e.g., create_pull_request, add-comment).
	SafeOutputs string `json:"safe-outputs,omitempty" yaml:"safe-outputs,omitempty"`

	// PatchFiles is a JSON string containing an array of patch file definitions.
	// Each object has "patch_path" (file path) and "contents" (patch content in am format).
	PatchFiles string `json:"patch-files,omitempty" yaml:"patch-files,omitempty"`
}

// ReplayPatchFile represents a single patch file entry in the replay-data.patch-files array.
type ReplayPatchFile struct {
	PatchPath string `json:"patch_path"`
	Contents  string `json:"contents"`
}

// ValidateReplayData validates the replay-data configuration.
// It checks that safe-outputs is valid JSON array and that patch-files (if present)
// is a valid JSON array of objects with required fields.
func ValidateReplayData(replayData *ReplayDataConfig) error {
	if replayData == nil {
		return nil
	}

	// Validate safe-outputs (required field when replay-data is present)
	if replayData.SafeOutputs == "" {
		return fmt.Errorf("replay-data.safe-outputs is required and cannot be empty")
	}

	// Validate safe-outputs is valid JSON array
	var safeOutputs []json.RawMessage
	if err := json.Unmarshal([]byte(replayData.SafeOutputs), &safeOutputs); err != nil {
		return fmt.Errorf("replay-data.safe-outputs must be a valid JSON array: %w", err)
	}
	if len(safeOutputs) == 0 {
		return fmt.Errorf("replay-data.safe-outputs must contain at least one item")
	}
	replayDataLog.Printf("Validated safe-outputs: %d items", len(safeOutputs))

	// Validate each safe output has a "type" field
	for i, item := range safeOutputs {
		var obj map[string]any
		if err := json.Unmarshal(item, &obj); err != nil {
			return fmt.Errorf("replay-data.safe-outputs[%d] must be a JSON object: %w", i, err)
		}
		if _, hasType := obj["type"]; !hasType {
			return fmt.Errorf("replay-data.safe-outputs[%d] must have a 'type' field", i)
		}
	}

	// Validate patch-files if present
	if replayData.PatchFiles != "" {
		var patchFiles []ReplayPatchFile
		if err := json.Unmarshal([]byte(replayData.PatchFiles), &patchFiles); err != nil {
			return fmt.Errorf("replay-data.patch-files must be a valid JSON array of {patch_path, contents} objects: %w", err)
		}
		for i, pf := range patchFiles {
			if pf.PatchPath == "" {
				return fmt.Errorf("replay-data.patch-files[%d].patch_path is required", i)
			}
			if pf.Contents == "" {
				return fmt.Errorf("replay-data.patch-files[%d].contents is required", i)
			}
		}
		replayDataLog.Printf("Validated patch-files: %d files", len(patchFiles))
	}

	return nil
}

// ParseReplayPatchFiles parses the patch-files JSON string into a slice of ReplayPatchFile.
func ParseReplayPatchFiles(patchFilesJSON string) ([]ReplayPatchFile, error) {
	if patchFilesJSON == "" {
		return nil, nil
	}
	var patchFiles []ReplayPatchFile
	if err := json.Unmarshal([]byte(patchFilesJSON), &patchFiles); err != nil {
		return nil, fmt.Errorf("failed to parse replay patch-files: %w", err)
	}
	return patchFiles, nil
}

// extractReplayDataConfig extracts the replay-data configuration from frontmatter.
// Returns nil if no replay-data section is present.
func (c *Compiler) extractReplayDataConfig(frontmatter map[string]any) *ReplayDataConfig {
	replayDataRaw, exists := frontmatter["replay-data"]
	if !exists {
		return nil
	}

	replayDataMap, ok := replayDataRaw.(map[string]any)
	if !ok {
		replayDataLog.Printf("replay-data is not a map, ignoring: %T", replayDataRaw)
		return nil
	}

	config := &ReplayDataConfig{}

	if safeOutputs, ok := replayDataMap["safe-outputs"].(string); ok {
		config.SafeOutputs = safeOutputs
	}

	if patchFiles, ok := replayDataMap["patch-files"].(string); ok {
		config.PatchFiles = patchFiles
	}

	replayDataLog.Printf("Extracted replay-data config: safe-outputs=%d chars, patch-files=%d chars",
		len(config.SafeOutputs), len(config.PatchFiles))

	return config
}
