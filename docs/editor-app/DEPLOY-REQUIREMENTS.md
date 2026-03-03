# Deploy to GitHub — Requirements

**Status**: Approved
**Date**: 2026-02-24
**References**: [DEPLOY-TO-GITHUB-PLAN.md](./DEPLOY-TO-GITHUB-PLAN.md), [SECURITY-REVIEW.md](./src/SECURITY-REVIEW.md)

---

## 1. User Workflows

### W-1: First-Time User (No Token)

1. User opens the editor, configures a workflow (or loads a template).
2. User clicks "Deploy to GitHub" in the Export menu.
3. Dialog opens at the **Token Setup** step.
4. User clicks "Create a token on GitHub" link — opens `github.com/settings/tokens/new?scopes=repo,workflow&description=gh-aw-editor-deploy` in a new tab.
5. User pastes token into the input field.
6. "Remember this token" checkbox is **unchecked by default**.
7. User clicks "Save & Continue".
8. System calls `GET /user` to validate token. On success, transitions to **Repo Selection** step.
9. User enters `owner/repo`, confirms branch name (auto-derived from workflow name), and clicks "Deploy".
10. System executes the 5-step deploy sequence (verify repo → create branch → upload .md → upload .lock.yml → create PR).
11. **Success** step shows a link to the PR. User clicks "View PR on GitHub" or "Done".

### W-2: Returning User (Saved Token)

1. User clicks "Deploy to GitHub".
2. System detects a saved token, calls `GET /user` to validate it.
3. If valid, dialog opens directly at the **Repo Selection** step (skips token setup).
4. If invalid/expired, dialog shows an error and falls back to the **Token Setup** step with the message "Your saved token is no longer valid. Please enter a new one."

### W-3: Deploy to a New/Empty Repo

1. User enters a repo slug for a repo that has no `.github/workflows/` directory yet.
2. Deploy succeeds — the GitHub Contents API creates intermediate directories automatically.
3. PR is created as normal. No special handling required.

### W-4: Deploy a Second Workflow (Branch Conflict)

1. User deploys workflow "issue-triage" → branch `aw/issue-triage` is created, PR opened.
2. User modifies the workflow and deploys again with the same branch name.
3. GitHub returns 422 ("Reference already exists") on `POST /repos/{owner}/{repo}/git/refs`.
4. System shows an error: "Branch `aw/issue-triage` already exists. Change the branch name or delete the existing branch on GitHub."
5. User changes branch name to `aw/issue-triage-v2` and retries successfully.

### W-5: Invalid or Expired Token

1. User's previously saved token is revoked or expired.
2. On deploy attempt, `GET /user` returns 401.
3. System clears the invalid token from memory (and localStorage if persisted).
4. Dialog shows **Token Setup** step with error: "Your token is invalid or expired. Please enter a new one."

---

## 2. Edge Cases

### E-1: Empty Workflow

- **Trigger**: User clicks "Deploy to GitHub" with no template loaded and no configuration.
- **Expected**: Deploy button is **disabled** in the Export menu. Tooltip: "Configure a workflow before deploying."
- **Gate condition**: `compiledMarkdown` is empty OR `compiledYaml` is empty OR `error` is non-null in `workflowStore`.

### E-2: Workflow Compiles with Warnings

- **Trigger**: WASM compiler returns warnings but no error, and `compiledYaml` is non-empty.
- **Expected**: Deploy is **allowed**. Warnings are shown in the Repo Selection step as a dismissible banner: "Compilation produced {N} warning(s). The workflow may not behave as expected."

### E-3: WASM Compiler Not Yet Loaded

- **Trigger**: User clicks "Deploy to GitHub" before the WASM compiler has initialized (`isReady === false` in `workflowStore`).
- **Expected**: Deploy button is **disabled** with tooltip "Compiler loading..." until `isReady` becomes `true`.

### E-4: Token Lacks Required Scope (403)

- **Trigger**: Token is valid (`GET /user` succeeds) but lacks `repo` or `workflow` scope. File upload returns 403.
- **Expected**: System shows error: "Your token doesn't have permission to push to this repository. Ensure your token has `repo` and `workflow` scopes." Deploy stops at the failed step; prior steps keep their checkmarks.

### E-5: Repo Doesn't Exist (404)

- **Trigger**: User enters a non-existent repo slug.
- **Expected**: Step 1 ("Verify repository access") fails with error: "Repository `{owner}/{repo}` not found. Check the name and your token's access."

### E-6: Branch Already Exists (422)

- See W-4 above. Error message includes the branch name and suggests renaming.

### E-7: Network Timeout / Failure

- **Trigger**: Any GitHub API call fails with a network error (no HTTP status).
- **Expected**: Current step shows error icon. Error message: "Network error — check your internet connection and try again." A "Retry" button appears that retries from the failed step (not from the beginning).

### E-8: User Closes Dialog Mid-Deploy

- **Trigger**: User clicks X or presses Escape while deploy is in progress.
- **Expected**: A confirmation prompt appears: "Deploy is in progress. Closing will cancel the remaining steps. Already-uploaded files will remain on GitHub." Options: "Continue Deploying" | "Close Anyway".
- If closed: deploy is cancelled, no PR is created (orphaned branch may remain).

### E-9: Malformed Repo Slug

- **Trigger**: User enters `/`, `a/b/c`, `../..`, or special characters.
- **Expected**: Inline validation error under the repo input: "Enter a valid repository in the format `owner/repo`." Deploy button stays disabled.
- **Validation regex**: `^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$`

### E-10: Invalid Branch Name

- **Trigger**: User edits auto-generated branch name to include `..`, spaces, `~`, `^`, `:`, `\`, or trailing `.lock`.
- **Expected**: Inline validation error: "Invalid branch name." Deploy button stays disabled.

### E-11: File Already Exists on Target Branch

- **Trigger**: User deploys a workflow whose `.md` or `.lock.yml` file already exists at the path on the base branch.
- **Expected**: The Contents API `PUT` creates or **updates** the file (specify `sha` of existing file). This is fine for a new branch. If the branch is new, no conflict is possible. No special handling needed.

### E-12: Very Large Workflow

- **Trigger**: Workflow markdown or compiled YAML exceeds GitHub's 1MB file size limit.
- **Expected**: System shows error: "Workflow file is too large (>{size}). Reduce the instructions or configuration." This is unlikely in practice.

---

## 3. Acceptance Criteria

Each criterion is testable via Playwright e2e tests or unit tests.

### AC-1: End-to-End Deploy (Happy Path)

**Test**: Load "Issue Triage" template → open Deploy dialog → enter a valid token → enter `{test-owner}/{test-repo}` → click Deploy → verify PR is created.

**Assertions**:
- [ ] PR exists at `https://github.com/{owner}/{repo}/pull/{number}`
- [ ] PR title matches `Add Agentic Workflow: {workflow-name}`
- [ ] PR base branch is `main` (or the repo's default branch)
- [ ] PR head branch matches the `branchName` field from the dialog

### AC-2: PR Contains Valid Workflow Source (.md)

**Test**: After AC-1, fetch the `.md` file from the PR branch.

**Assertions**:
- [ ] File exists at `.github/workflows/{name}.md`
- [ ] File content starts with `---` (YAML frontmatter delimiter)
- [ ] File contains `name:` field in frontmatter
- [ ] File contains `on:` field in frontmatter
- [ ] File contains `engine:` field in frontmatter
- [ ] File contains an instructions section (markdown body after frontmatter)
- [ ] File content matches `workflowStore.compiledMarkdown` byte-for-byte

### AC-3: PR Contains Valid Compiled YAML (.lock.yml)

**Test**: After AC-1, fetch the `.lock.yml` file from the PR branch.

**Assertions**:
- [ ] File exists at `.github/workflows/{name}.lock.yml`
- [ ] File parses as valid YAML
- [ ] YAML contains top-level `name:` key
- [ ] YAML contains top-level `on:` key
- [ ] YAML contains `jobs:` with at least one job
- [ ] File content matches `workflowStore.compiledYaml` byte-for-byte

### AC-4: Error Messages Are Clear and Actionable

**Test**: Trigger each error condition and verify the displayed message.

| Condition | Expected Message (substring match) |
|-----------|-----------------------------------|
| Invalid token (401) | "invalid or expired" |
| Repo not found (404) | "not found" |
| Missing scope (403) | "permission" |
| Branch exists (422) | "already exists" |
| Network failure | "Network error" |
| Malformed repo slug | "owner/repo" (format hint) |

**Assertions**:
- [ ] Error messages do NOT contain the token string
- [ ] Error messages include the specific resource that failed (repo name, branch name)
- [ ] Each error message suggests a corrective action

### AC-5: Token Not Persisted by Default

**Test**: Enter token with "Remember" unchecked → close dialog → reopen.

**Assertions**:
- [ ] `localStorage.getItem('gh-aw-deploy')` does NOT contain a token string after dialog close (when "Remember" is unchecked)
- [ ] `rememberToken` defaults to `false` in `deployStore` initial state
- [ ] After page refresh, the token is gone and the dialog starts at the Token Setup step
- [ ] When "Remember" IS checked: `localStorage` contains the token, and re-opening skips to Repo Selection

### AC-6: Deploy Button Disabled When Workflow Is Empty

**Test**: Reset the editor to empty state → check Deploy button.

**Assertions**:
- [ ] Deploy menu item is disabled (not clickable) when `compiledYaml` is empty
- [ ] Deploy menu item is disabled when `compiledMarkdown` is empty
- [ ] Deploy menu item is disabled when `error` is non-null in `workflowStore`
- [ ] Deploy menu item is disabled when `isReady` is `false` (compiler not loaded)
- [ ] Deploy menu item becomes enabled after loading a template and successful compilation

### AC-7: Progress Steps Animate Correctly

**Test**: Initiate a deploy and observe each step.

**Assertions**:
- [ ] Exactly 5 steps are shown: "Verify repository access", "Create branch", "Upload workflow source", "Upload compiled YAML", "Create pull request"
- [ ] Each step starts with a pending indicator (e.g., empty circle)
- [ ] The currently executing step shows a spinner/loading indicator
- [ ] Completed steps show a checkmark
- [ ] On error, the failed step shows an error icon; subsequent steps remain pending
- [ ] Steps transition in order (no skipping)

### AC-8: Dark Mode Compatible

**Test**: Toggle theme to dark mode → open Deploy dialog.

**Assertions**:
- [ ] Dialog background uses dark theme colors (not white)
- [ ] Text is readable (sufficient contrast ratio)
- [ ] Input fields have dark theme styling
- [ ] Progress indicators (checkmarks, spinners, error icons) are visible on dark background
- [ ] No hardcoded colors that break in dark mode

---

## 4. Security Requirements

These are derived from the [security review](./src/SECURITY-REVIEW.md) and must be addressed in implementation.

### S-1: Input Validation

- [ ] Repo slug validated with `^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$` before any API call
- [ ] Branch name validated against git ref rules (no `..`, no `\`, no trailing `.lock`, no ASCII control chars)
- [ ] All user-supplied path segments (`owner`, `repo`, `branch`, `filepath`) use `encodeURIComponent()` in API URLs

### S-2: Token Safety

- [ ] `rememberToken` defaults to `false`
- [ ] Token is never logged to console
- [ ] Token is never included in error messages shown to the user
- [ ] Token is transmitted only via `Authorization` header over HTTPS
- [ ] A "Clear saved token" option is accessible from the deploy dialog at all times

### S-3: PR Body Safety

- [ ] `${{ }}` patterns in user-authored content are escaped (rendered as code literals) before inclusion in PR body
- [ ] PR body does not include raw workflow instructions that could contain injection strings

### S-4: Modern APIs

- [ ] No usage of deprecated `unescape()` — use `TextEncoder` for UTF-8 base64 encoding

### S-5: Double-Submit Protection

- [ ] Deploy button is disabled while a deploy is in progress
- [ ] Re-clicking "Deploy" during an active deploy does not trigger a second API call sequence

---

## 5. Non-Functional Requirements

### NF-1: No Backend Required

- All API calls go directly from the browser to `api.github.com` via `fetch()`.
- No CORS proxy, no Cloudflare Worker, no server-side component.

### NF-2: No New Heavy Dependencies

- Use native `fetch()` for GitHub API calls — do NOT add `@octokit/rest` or `axios`.
- The only new dependencies should be those already in `package.json` (Radix Dialog is already present).

### NF-3: Copy CLI Command Fallback

- The Export menu should also offer "Copy CLI command" that generates a `gh aw compile` + `gh pr create` command sequence for users who prefer not to use browser tokens.

### NF-4: State Cleanup

- On dialog close (after success or cancel), reset the deploy store's transient state (progress, error, prUrl) but preserve token/username if remembered.

---

## 6. Files to Create

| File | Purpose |
|------|---------|
| `src/stores/deployStore.ts` | Zustand store: token, step, repo, progress, prUrl |
| `src/utils/githubApi.ts` | `fetch()` wrapper for GitHub REST API (7 endpoints) |
| `src/utils/deploy.ts` | Orchestration: validate → branch → files → PR |
| `src/components/Deploy/DeployDialog.tsx` | Multi-step Radix Dialog container |
| `src/components/Deploy/TokenSetup.tsx` | Step 1: token input + validation |
| `src/components/Deploy/RepoSelector.tsx` | Step 2: repo/branch inputs + validation |
| `src/components/Deploy/DeployProgress.tsx` | Step 3: animated progress checklist |
| `src/components/Deploy/DeploySuccess.tsx` | Step 4: PR link + done button |

## 7. Files to Modify

| File | Change |
|------|--------|
| `src/components/Header/ExportMenu.tsx` | Add "Deploy to GitHub" and "Copy CLI Command" items |
