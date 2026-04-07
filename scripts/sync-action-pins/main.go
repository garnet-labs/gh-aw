// sync-action-pins converts .github/workflows/aw-lock.json (JSON) into
// pkg/workflow/data/action_pins.json (the embedded JSON fallback used by the
// compiler for SHA pinning when the GitHub API is unavailable).
//
// It also supports the legacy source path .github/aw/actions-lock.json for
// repositories that have not yet migrated.
//
// Usage: go run ./scripts/sync-action-pins
package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/github/gh-aw/pkg/workflow"
)

func main() {
	sourcePaths := []string{
		".github/workflows/aw-lock.json",
		".github/aw/actions-lock.json",
	}

	foundSource := false
	for _, path := range sourcePaths {
		if _, err := os.Stat(path); err == nil {
			foundSource = true
			break
		} else if !os.IsNotExist(err) {
			fmt.Fprintf(os.Stderr, "Error checking %s: %v\n", path, err)
			os.Exit(1)
		}
	}

	if !foundSource {
		fmt.Fprintf(os.Stderr, "Error: no action cache source file found; expected %q or %q\n", sourcePaths[0], sourcePaths[1])
		os.Exit(1)
	}

	cache := workflow.NewActionCache(".")
	if err := cache.Load(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: failed to load action cache: %v\n", err)
		os.Exit(1)
	}

	type actionPin struct {
		Repo    string                               `json:"repo"`
		Version string                               `json:"version"`
		SHA     string                               `json:"sha"`
		Inputs  map[string]*workflow.ActionYAMLInput `json:"inputs,omitempty"`
		// ActionDescription is intentionally omitted: action_pins.json is the embedded
		// fallback used only for SHA pinning; descriptions are only needed at compile time
		// from the user-facing aw-lock.json cache and are not part of ActionPin.
	}
	type actionPinsData struct {
		Entries map[string]actionPin `json:"entries"`
	}

	entries := make(map[string]actionPin, len(cache.Entries))
	for key, e := range cache.Entries {
		entries[key] = actionPin{
			Repo:    e.Repo,
			Version: e.Version,
			SHA:     e.SHA,
			Inputs:  e.Inputs,
		}
	}

	data := actionPinsData{Entries: entries}
	out, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error marshaling action_pins.json: %v\n", err)
		os.Exit(1)
	}
	out = append(out, '\n')

	dest := "pkg/workflow/data/action_pins.json"
	if err := os.WriteFile(dest, out, 0644); err != nil {
		fmt.Fprintf(os.Stderr, "Error writing %s: %v\n", dest, err)
		os.Exit(1)
	}

	fmt.Printf("✓ Synced %d action pins to %s\n", len(entries), dest)
}
