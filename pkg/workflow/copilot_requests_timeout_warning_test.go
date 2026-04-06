//go:build !integration

package workflow

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"

	"github.com/github/gh-aw/pkg/constants"
)

// TestParseTimeoutMinutesInt tests the parseTimeoutMinutesInt helper.
func TestParseTimeoutMinutesInt(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected int
	}{
		{
			name:     "parses integer value",
			input:    "timeout-minutes: 90",
			expected: 90,
		},
		{
			name:     "parses value at boundary",
			input:    "timeout-minutes: 60",
			expected: 60,
		},
		{
			name:     "parses small value",
			input:    "timeout-minutes: 20",
			expected: 20,
		},
		{
			name:     "expression returns zero",
			input:    "timeout-minutes: ${{ inputs.timeout }}",
			expected: 0,
		},
		{
			name:     "empty string returns zero",
			input:    "",
			expected: 0,
		},
		{
			name:     "bare integer without prefix returns zero (non-parseable)",
			input:    "not-a-number",
			expected: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseTimeoutMinutesInt(tt.input)
			if got != tt.expected {
				t.Errorf("parseTimeoutMinutesInt(%q) = %d, want %d", tt.input, got, tt.expected)
			}
		})
	}
}

// TestCopilotRequestsTimeoutWarning tests that a compile-time warning is emitted when
// features: copilot-requests: true is combined with timeout-minutes > 60.
func TestCopilotRequestsTimeoutWarning(t *testing.T) {
	engine := NewCopilotEngine()

	tests := []struct {
		name          string
		timeoutMins   string
		features      map[string]any
		expectWarning bool
	}{
		{
			name:        "warning emitted: copilot-requests enabled and timeout > 60",
			timeoutMins: "timeout-minutes: 90",
			features: map[string]any{
				string(constants.CopilotRequestsFeatureFlag): true,
			},
			expectWarning: true,
		},
		{
			name:        "no warning: copilot-requests enabled but timeout == 60",
			timeoutMins: "timeout-minutes: 60",
			features: map[string]any{
				string(constants.CopilotRequestsFeatureFlag): true,
			},
			expectWarning: false,
		},
		{
			name:        "no warning: copilot-requests enabled but timeout < 60",
			timeoutMins: "timeout-minutes: 30",
			features: map[string]any{
				string(constants.CopilotRequestsFeatureFlag): true,
			},
			expectWarning: false,
		},
		{
			name:          "no warning: copilot-requests disabled and timeout > 60",
			timeoutMins:   "timeout-minutes: 90",
			features:      map[string]any{},
			expectWarning: false,
		},
		{
			name:          "no warning: copilot-requests absent and timeout > 60",
			timeoutMins:   "timeout-minutes: 90",
			features:      nil,
			expectWarning: false,
		},
		{
			name:        "no warning: expression timeout is gracefully skipped",
			timeoutMins: "timeout-minutes: ${{ inputs.timeout }}",
			features: map[string]any{
				string(constants.CopilotRequestsFeatureFlag): true,
			},
			expectWarning: false,
		},
		{
			name:        "no warning: empty timeout is skipped",
			timeoutMins: "",
			features: map[string]any{
				string(constants.CopilotRequestsFeatureFlag): true,
			},
			expectWarning: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			workflowData := &WorkflowData{
				TimeoutMinutes: tt.timeoutMins,
				Features:       tt.features,
				Tools:          map[string]any{},
			}

			// Capture stderr
			oldStderr := os.Stderr
			r, w, _ := os.Pipe()
			os.Stderr = w

			engine.GetExecutionSteps(workflowData, "/tmp/test.log")

			w.Close()
			os.Stderr = oldStderr
			var buf bytes.Buffer
			_, _ = io.Copy(&buf, r)
			stderrOutput := buf.String()

			expectedPhrase := "copilot-requests: true with timeout-minutes > 60"
			if tt.expectWarning {
				if !strings.Contains(stderrOutput, expectedPhrase) {
					t.Errorf("expected warning containing %q in stderr, got:\n%s", expectedPhrase, stderrOutput)
				}
			} else {
				if strings.Contains(stderrOutput, expectedPhrase) {
					t.Errorf("did not expect warning %q in stderr, got:\n%s", expectedPhrase, stderrOutput)
				}
			}
		})
	}
}
