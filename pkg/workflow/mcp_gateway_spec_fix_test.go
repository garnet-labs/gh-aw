//go:build !integration

package workflow

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestMCPServerEntrypointField tests that MCP servers support optional entrypoint field
func TestMCPServerEntrypointField(t *testing.T) {
	tests := []struct {
		name                 string
		mcpConfig            map[string]any
		expectEntrypoint     string
		expectEntrypointArgs []string
		expectError          bool
	}{
		{
			name: "entrypoint with entrypointArgs",
			mcpConfig: map[string]any{
				"container":      "ghcr.io/example/server:latest",
				"entrypoint":     "/custom/entrypoint.sh",
				"entrypointArgs": []any{"--verbose", "--port", "8080"},
			},
			expectEntrypoint:     "/custom/entrypoint.sh",
			expectEntrypointArgs: []string{"--verbose", "--port", "8080"},
			expectError:          false,
		},
		{
			name: "entrypoint without entrypointArgs",
			mcpConfig: map[string]any{
				"container":  "ghcr.io/example/server:latest",
				"entrypoint": "/bin/sh",
			},
			expectEntrypoint:     "/bin/sh",
			expectEntrypointArgs: nil,
			expectError:          false,
		},
		{
			name: "entrypointArgs without entrypoint (existing behavior)",
			mcpConfig: map[string]any{
				"container":      "ghcr.io/example/server:latest",
				"entrypointArgs": []any{"--config", "/etc/config.json"},
			},
			expectEntrypoint:     "",
			expectEntrypointArgs: []string{"--config", "/etc/config.json"},
			expectError:          false,
		},
		{
			name: "no entrypoint or entrypointArgs",
			mcpConfig: map[string]any{
				"container": "ghcr.io/example/server:latest",
			},
			expectEntrypoint:     "",
			expectEntrypointArgs: nil,
			expectError:          false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			compiler := &Compiler{}
			extracted := compiler.extractMCPGatewayConfig(tt.mcpConfig)

			if tt.expectError {
				// For now, we don't expect errors, but this is for future validation
				return
			}

			require.NotNil(t, extracted, "Extraction should not return nil")

			// Verify entrypoint extraction
			assert.Equal(t, tt.expectEntrypoint, extracted.Entrypoint, "Entrypoint mismatch")
			assert.ElementsMatch(t, tt.expectEntrypointArgs, extracted.EntrypointArgs, "EntrypointArgs mismatch")
		})
	}
}
