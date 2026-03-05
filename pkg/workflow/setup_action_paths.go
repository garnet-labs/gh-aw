package workflow

import "fmt"

// GhAwHome is the shell expression for GH_AW_HOME with a fallback to /opt/gh-aw.
// Use this in bash `run:` contexts where shell variable expansion occurs.
const GhAwHome = "${GH_AW_HOME:-/opt/gh-aw}"

// GhAwHomeJS is the JavaScript expression for GH_AW_HOME with a fallback.
// Use this inside require() or other JS expressions in github-script steps.
const GhAwHomeJS = "(process.env.GH_AW_HOME || '/opt/gh-aw')"

// SetupActionDestination is the path where the setup action copies script files
// on the agent runner (e.g. /opt/gh-aw/actions).
// This is a shell expression expanded at runtime.
const SetupActionDestination = GhAwHome + "/actions"

// JsRequireGhAw generates a JavaScript require() argument expression for a file
// under GH_AW_HOME. The relativePath should be like "actions/foo.cjs".
func JsRequireGhAw(relativePath string) string {
	return fmt.Sprintf("%s + '/%s'", GhAwHomeJS, relativePath)
}
