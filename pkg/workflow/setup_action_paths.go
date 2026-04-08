package workflow

import "github.com/github/gh-aw/pkg/constants"

// SetupActionDestination is the path where the setup action copies script files
// on the agent runner (/tmp/gh-aw/actions).
const SetupActionDestination = constants.GhAwRootDir + "/actions"

// SetupActionDestinationShell is the same as SetupActionDestination for use inside `run:` blocks.
const SetupActionDestinationShell = constants.GhAwRootDirShell + "/actions"

// SafeOutputsDir is the directory for safe-outputs files on the runner.
const SafeOutputsDir = constants.GhAwRootDir + "/safeoutputs"

// SafeOutputsDirShell is the same as SafeOutputsDir for use inside shell `run:` blocks.
const SafeOutputsDirShell = constants.GhAwRootDirShell + "/safeoutputs"

// GhAwMCPScriptsDir is the directory for MCP scripts files on the runner
const GhAwMCPScriptsDir = constants.GhAwRootDirShell + "/mcp-scripts"

// GhAwBinaryPath is the path to the gh-aw binary on the runner
const GhAwBinaryPath = constants.GhAwRootDirShell + "/gh-aw"

// SafeJobsDownloadDir is the directory for safe job files on the runner
const SafeJobsDownloadDir = constants.GhAwRootDirShell + "/safe-jobs/"
