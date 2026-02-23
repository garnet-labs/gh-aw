// @ts-check
/// <reference types="@actions/github-script" />

/**
 * @fileoverview CI Trigger Commit Helper
 *
 * Pushes an empty commit to a branch using a different token to trigger CI events.
 * This works around the GitHub Actions limitation where events created with
 * GITHUB_TOKEN do not trigger other workflow runs.
 *
 * The token can come from:
 * 1. Explicit `github-ci-trigger-token` in safe-outputs config (passed as GH_AW_CI_TRIGGER_TOKEN env var)
 * 2. Implicit `GH_AW_CI_TRIGGER_TOKEN` repository secret
 * 3. `github-ci-trigger-token: app` for GitHub App authentication
 */

/**
 * Push an empty commit to a branch using a CI trigger token.
 * This commit is pushed with different authentication so that push/PR events
 * are triggered for CI checks to run.
 *
 * @param {Object} options - Options for the CI trigger commit
 * @param {string} options.branchName - The branch to push the empty commit to
 * @param {string} options.repoOwner - Repository owner
 * @param {string} options.repoName - Repository name
 * @param {string} [options.commitMessage] - Custom commit message (default: "ci: trigger CI checks")
 * @returns {Promise<{success: boolean, skipped?: boolean, error?: string}>}
 */
async function pushCITriggerCommit({ branchName, repoOwner, repoName, commitMessage }) {
  const ciTriggerToken = process.env.GH_AW_CI_TRIGGER_TOKEN;

  if (!ciTriggerToken || !ciTriggerToken.trim()) {
    core.info("No CI trigger token configured - skipping CI trigger commit");
    return { success: true, skipped: true };
  }

  core.info("CI trigger token detected - pushing empty commit to trigger CI events");

  try {
    // Configure git remote with the CI trigger token for authentication
    const remoteUrl = `https://x-access-token:${ciTriggerToken}@github.com/${repoOwner}/${repoName}.git`;

    // Add a temporary remote with the CI trigger token
    try {
      await exec.exec("git", ["remote", "remove", "ci-trigger"]);
    } catch {
      // Remote doesn't exist yet, that's fine
    }
    await exec.exec("git", ["remote", "add", "ci-trigger", remoteUrl]);

    // Create and push an empty commit
    const message = commitMessage || "ci: trigger CI checks";
    await exec.exec("git", ["commit", "--allow-empty", "-m", message]);
    await exec.exec("git", ["push", "ci-trigger", branchName]);

    core.info(`CI trigger commit pushed to ${branchName} successfully`);

    // Clean up the temporary remote
    try {
      await exec.exec("git", ["remote", "remove", "ci-trigger"]);
    } catch {
      // Non-fatal cleanup error
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.warning(`Failed to push CI trigger commit: ${errorMessage}`);

    // Clean up the temporary remote on failure
    try {
      await exec.exec("git", ["remote", "remove", "ci-trigger"]);
    } catch {
      // Non-fatal cleanup error
    }

    // CI trigger failure is not fatal - the main push already succeeded
    return { success: false, error: errorMessage };
  }
}

module.exports = { pushCITriggerCommit };
