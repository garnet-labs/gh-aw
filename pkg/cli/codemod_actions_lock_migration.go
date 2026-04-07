package cli

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/github/gh-aw/pkg/console"
	"github.com/github/gh-aw/pkg/workflow"
)

// getActionsLockMigrationCodemod returns a file-level codemod that migrates the
// old .github/aw/actions-lock.json to the new .github/workflows/aw-lock.json format.
// The Apply function is a no-op (it doesn't modify workflow files); the actual
// migration is performed by MigrateActionsLockFile which is called from fix_command.go.
func getActionsLockMigrationCodemod() Codemod {
	return Codemod{
		ID:           "migrate-actions-lock-file",
		Name:         "Migrate actions-lock.json to aw-lock.json",
		Description:  "Moves .github/aw/actions-lock.json to .github/workflows/aw-lock.json with the new JSON format",
		IntroducedIn: "0.71.0",
		Apply: func(content string, frontmatter map[string]any) (string, bool, error) {
			// This codemod is handled by MigrateActionsLockFile (called from fix_command.go).
			// It doesn't modify workflow files, so return content unchanged.
			return content, false, nil
		},
	}
}

// MigrateActionsLockFile moves .github/aw/actions-lock.json to
// .github/workflows/aw-lock.json and migrates the format (entries → actions, adds version).
// Returns (migrated, error): migrated is true when the migration was performed.
func MigrateActionsLockFile(write bool, verbose bool) (bool, error) {
	legacyPath := filepath.Join(".github", "aw", workflow.LegacyCacheFileName)
	newPath := filepath.Join(".github", "workflows", workflow.CacheFileName)

	// Check whether the legacy file exists.
	if _, err := os.Stat(legacyPath); os.IsNotExist(err) {
		return false, nil // nothing to migrate
	}

	if verbose || !write {
		fmt.Fprintf(os.Stderr, "%s\n", console.FormatInfoMessage(
			fmt.Sprintf("Found legacy %s – migrating to %s", legacyPath, newPath)))
	}

	if !write {
		fmt.Fprintf(os.Stderr, "%s\n", console.FormatInfoMessage(
			fmt.Sprintf("Would migrate %s to %s", legacyPath, newPath)))
		return true, nil
	}

	// If the new file already exists, skip migration to avoid overwriting.
	if _, err := os.Stat(newPath); err == nil {
		// Both files exist: warn and remove the legacy file.
		fmt.Fprintf(os.Stderr, "%s\n", console.FormatWarningMessage(
			fmt.Sprintf("%s already exists; removing legacy %s", newPath, legacyPath)))
		if err := os.Remove(legacyPath); err != nil {
			return false, fmt.Errorf("removing legacy %s: %w", legacyPath, err)
		}
		return true, nil
	}

	// Load via ActionCache (which handles the legacy JSON format) and re-save
	// to the new path with the updated schema (entries → actions, adds version).
	cache := workflow.NewActionCache(".")
	if err := cache.Load(); err != nil {
		return false, fmt.Errorf("loading %s: %w", legacyPath, err)
	}

	// Force a save even if the cache appears clean (it was loaded from the old path).
	cache.MarkDirty()

	if err := cache.Save(); err != nil {
		return false, fmt.Errorf("saving %s: %w", newPath, err)
	}

	// Remove the old file.
	if err := os.Remove(legacyPath); err != nil {
		return false, fmt.Errorf("removing legacy %s: %w", legacyPath, err)
	}

	fmt.Fprintf(os.Stderr, "%s\n", console.FormatSuccessMessage(
		fmt.Sprintf("Migrated %s → %s", legacyPath, newPath)))
	return true, nil
}
