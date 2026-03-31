package cli

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/cli/go-gh/v2/pkg/api"
	"github.com/github/gh-aw/pkg/console"
	"github.com/github/gh-aw/pkg/constants"
	"github.com/github/gh-aw/pkg/logger"
	"github.com/github/gh-aw/pkg/workflow"
	"golang.org/x/mod/semver"
)

var updateCheckLog = logger.New("cli:update_check")

const (
	// lastCheckFileName is the name of the file that tracks the last update check timestamp
	lastCheckFileName = "gh-aw-last-update-check"
	// checkInterval is how often we check for updates (24 hours)
	checkInterval = 24 * time.Hour
)

// Release represents a GitHub release
type Release struct {
	TagName string `json:"tag_name"`
	Name    string `json:"name"`
	HTMLURL string `json:"html_url"`
}

// shouldCheckForUpdate determines if we should check for updates based on:
// - CI mode (disabled)
// - MCP server mode (disabled via parent command detection)
// - Time since last check (once per day)
// - --no-check-update flag
func shouldCheckForUpdate(noCheckUpdate bool) bool {
	// Skip if explicitly disabled
	if noCheckUpdate {
		updateCheckLog.Print("Update check disabled via --no-check-update flag")
		return false
	}

	// Skip in CI environments
	if IsRunningInCI() {
		updateCheckLog.Print("Update check disabled in CI environment")
		return false
	}

	// Skip if running as MCP server (detected by checking if parent command is "mcp-server")
	// When gh aw is invoked from MCP server, it's spawned as a subprocess
	if isRunningAsMCPServer() {
		updateCheckLog.Print("Update check disabled in MCP server mode")
		return false
	}

	// Check if we've already checked recently
	lastCheckFile := getLastCheckFilePath()
	if lastCheckFile == "" {
		updateCheckLog.Print("Could not determine last check file path")
		return false
	}

	// Read last check time
	data, err := os.ReadFile(lastCheckFile)
	if err != nil {
		if !os.IsNotExist(err) {
			updateCheckLog.Printf("Error reading last check file: %v", err)
		}
		// File doesn't exist or error reading - perform check
		return true
	}

	lastCheck, err := time.Parse(time.RFC3339, strings.TrimSpace(string(data)))
	if err != nil {
		updateCheckLog.Printf("Error parsing last check time: %v", err)
		// Invalid timestamp - perform check
		return true
	}

	// Check if enough time has passed
	if time.Since(lastCheck) < checkInterval {
		updateCheckLog.Printf("Last check was %v ago, skipping", time.Since(lastCheck))
		return false
	}

	updateCheckLog.Print("Last check was more than 24 hours ago, performing check")
	return true
}

// isRunningAsMCPServer detects if we're running as a subprocess of mcp-server
// This is a heuristic - we can't reliably detect this, so we're conservative
func isRunningAsMCPServer() bool {
	// Check for MCP_SERVER environment variable that could be set by the MCP server
	return os.Getenv("GH_AW_MCP_SERVER") != ""
}

var (
	// getLastCheckFilePathFunc allows overriding in tests
	getLastCheckFilePathFunc = getLastCheckFilePathImpl
	// getLatestReleaseFunc allows overriding in tests
	getLatestReleaseFunc = getLatestRelease
	// getLatestAWFReleaseFunc allows overriding in tests
	getLatestAWFReleaseFunc = getLatestAWFRelease
)

// getLastCheckFilePath returns the path to the last check timestamp file
func getLastCheckFilePath() string {
	return getLastCheckFilePathFunc()
}

// getLastCheckFilePathImpl is the actual implementation
func getLastCheckFilePathImpl() string {
	// Use OS temp directory for cross-platform compatibility
	tmpDir := os.TempDir()
	if tmpDir == "" {
		updateCheckLog.Print("Could not determine temp directory")
		return ""
	}

	// Create a gh-aw subdirectory in temp
	ghAwTmpDir := filepath.Join(tmpDir, "gh-aw")
	if err := os.MkdirAll(ghAwTmpDir, 0755); err != nil {
		updateCheckLog.Printf("Error creating gh-aw temp directory: %v", err)
		return ""
	}

	return filepath.Join(ghAwTmpDir, lastCheckFileName)
}

// updateLastCheckTime updates the timestamp of the last update check
func updateLastCheckTime() {
	lastCheckFile := getLastCheckFilePath()
	if lastCheckFile == "" {
		return
	}

	timestamp := time.Now().Format(time.RFC3339)
	if err := os.WriteFile(lastCheckFile, []byte(timestamp), 0644); err != nil {
		updateCheckLog.Printf("Error writing last check time: %v", err)
	}
}

// checkForUpdates checks if a newer version of gh-aw or gh-aw-firewall is available.
// This function is non-blocking and ignores all errors (connectivity, API, etc.)
func checkForUpdates(noCheckUpdate bool, verbose bool) {
	// Quick check if we should even attempt the update check
	if !shouldCheckForUpdate(noCheckUpdate) {
		return
	}

	updateCheckLog.Print("Checking for gh-aw updates...")

	// Update the last check time immediately to prevent concurrent checks
	updateLastCheckTime()

	// Get current version
	currentVersion := GetVersion()
	if !workflow.IsReleasedVersion(currentVersion) {
		updateCheckLog.Print("Not a released version, skipping update check")
		return
	}

	// Check gh-aw and gh-aw-firewall for updates concurrently
	checkForGhAwUpdates(currentVersion, verbose)
	checkForAWFUpdates()
}

// checkForGhAwUpdates checks if a newer version of gh-aw is available and notifies the user.
func checkForGhAwUpdates(currentVersion string, verbose bool) {
	// Query GitHub API for latest release
	latestVersion, err := getLatestReleaseFunc()
	if err != nil {
		// Silently ignore errors - update check should never fail the command
		updateCheckLog.Printf("Error checking for updates (ignoring): %v", err)
		return
	}

	if latestVersion == "" {
		updateCheckLog.Print("Could not determine latest version")
		return
	}

	// Ensure versions have 'v' prefix for semver comparison
	current := ensureVPrefix(currentVersion)
	latest := ensureVPrefix(latestVersion)

	cmp := semver.Compare(current, latest)

	if cmp == 0 {
		if verbose {
			updateCheckLog.Print("gh-aw is up to date")
		}
		return
	}

	// Check if we're on a newer version (development/prerelease)
	if cmp > 0 {
		updateCheckLog.Printf("Current version (%s) appears newer than latest release (%s), skipping notification", currentVersion, latestVersion)
		return
	}

	// A newer version is available - display update message
	updateCheckLog.Printf("Newer version available: %s (current: %s)", latestVersion, currentVersion)
	fmt.Fprintln(os.Stderr, "")
	fmt.Fprintln(os.Stderr, console.FormatInfoMessage(fmt.Sprintf("A new version of gh-aw is available: %s (current: %s)", latestVersion, currentVersion)))
	fmt.Fprintln(os.Stderr, console.FormatInfoMessage("Update with: gh extension upgrade github/gh-aw"))
	fmt.Fprintln(os.Stderr, "")
}

// getLatestRelease queries GitHub API for the latest release of gh-aw
func getLatestRelease() (string, error) {
	updateCheckLog.Print("Querying GitHub API for latest release...")

	// Create GitHub REST client using go-gh
	client, err := api.NewRESTClient(api.ClientOptions{})
	if err != nil {
		return "", fmt.Errorf("failed to create GitHub client: %w", err)
	}

	// Query the latest release
	var release Release
	err = client.Get("repos/github/gh-aw/releases/latest", &release)
	if err != nil {
		return "", fmt.Errorf("failed to query latest release: %w", err)
	}

	updateCheckLog.Printf("Latest release: %s", release.TagName)
	return release.TagName, nil
}

// getLatestAWFRelease queries GitHub API for the latest release of gh-aw-firewall
func getLatestAWFRelease() (string, error) {
	updateCheckLog.Print("Querying GitHub API for latest gh-aw-firewall release...")

	client, err := api.NewRESTClient(api.ClientOptions{})
	if err != nil {
		return "", fmt.Errorf("failed to create GitHub client: %w", err)
	}

	var release Release
	err = client.Get("repos/github/gh-aw-firewall/releases/latest", &release)
	if err != nil {
		return "", fmt.Errorf("failed to query latest gh-aw-firewall release: %w", err)
	}

	updateCheckLog.Printf("Latest gh-aw-firewall release: %s", release.TagName)
	return release.TagName, nil
}

// checkForAWFUpdates checks if a newer version of gh-aw-firewall is available
// compared to the bundled default version. Errors are silently ignored.
func checkForAWFUpdates() {
	bundledVersion := string(constants.DefaultFirewallVersion)

	latestVersion, err := getLatestAWFReleaseFunc()
	if err != nil {
		updateCheckLog.Printf("Error checking for gh-aw-firewall updates (ignoring): %v", err)
		return
	}

	if latestVersion == "" {
		updateCheckLog.Print("Could not determine latest gh-aw-firewall version")
		return
	}

	// Ensure versions have 'v' prefix for semver comparison
	bundled := ensureVPrefix(bundledVersion)
	latest := ensureVPrefix(latestVersion)

	cmp := semver.Compare(bundled, latest)

	if cmp == 0 {
		updateCheckLog.Print("gh-aw-firewall is up to date")
		return
	}

	// If bundled version is already newer, skip
	if cmp > 0 {
		updateCheckLog.Printf("Bundled gh-aw-firewall (%s) appears newer than latest release (%s), skipping notification", bundledVersion, latestVersion)
		return
	}

	// A newer AWF version is available – updating gh-aw will pick it up
	updateCheckLog.Printf("Newer gh-aw-firewall available: %s (bundled: %s)", latestVersion, bundledVersion)
	fmt.Fprintln(os.Stderr, console.FormatInfoMessage(fmt.Sprintf("A new version of gh-aw-firewall is available: %s (bundled: %s)", latestVersion, bundledVersion)))
	fmt.Fprintln(os.Stderr, console.FormatInfoMessage("Update with: gh extension upgrade github/gh-aw"))
	fmt.Fprintln(os.Stderr, "")
}

// ensureVPrefix ensures a version string starts with 'v' as required by golang.org/x/mod/semver
func ensureVPrefix(version string) string {
	if !strings.HasPrefix(version, "v") {
		return "v" + version
	}
	return version
}

// CheckForUpdatesAsync performs update check in background (best effort)
// This is called from compile command and should never block or fail the compilation
// The context can be used to cancel the update check if the program is shutting down
func CheckForUpdatesAsync(ctx context.Context, noCheckUpdate bool, verbose bool) {
	// Run check in goroutine to avoid blocking compilation
	go func() {
		// Recover from any panics in the update check
		defer func() {
			if r := recover(); r != nil {
				updateCheckLog.Printf("Panic in update check (recovered): %v", r)
			}
		}()

		// Check if context was cancelled before starting
		if ctx.Err() != nil {
			updateCheckLog.Printf("Update check cancelled before starting: %v", ctx.Err())
			return
		}

		checkForUpdates(noCheckUpdate, verbose)
	}()

	// Give the goroutine a small window to complete quickly
	// This allows the message to appear before compilation starts
	// but doesn't block if the check takes longer
	select {
	case <-time.After(100 * time.Millisecond):
		// Continue after timeout
	case <-ctx.Done():
		// Context cancelled during wait
		return
	}
}
