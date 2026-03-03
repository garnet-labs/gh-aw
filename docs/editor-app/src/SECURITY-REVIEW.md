# Security Review: Deploy to GitHub Feature

**Date**: 2026-02-24
**Reviewer**: security-reviewer (automated audit)
**Scope**: `src/utils/githubApi.ts`, `src/stores/deployStore.ts`, `src/utils/deploy.ts`, `src/components/Deploy/*.tsx`

---

## Summary

The Deploy to GitHub feature allows users to authenticate with a GitHub Personal Access Token, select a repository, and create a pull request containing workflow files. Overall the implementation follows reasonable patterns, but there are several findings that should be addressed before production use.

**Overall Risk**: Medium

---

## Findings

### 1. Token Persisted in localStorage by Default

**Severity**: Medium
**File**: `src/stores/deployStore.ts:63`

The `rememberToken` flag defaults to `true`, which means the PAT is silently persisted in `localStorage` (under key `gh-aw-deploy`) without the user explicitly opting in. On shared or public computers, this leaves the token accessible to anyone with physical access or any JavaScript running on the same origin.

**Recommendation**:
- Change `rememberToken` default to `false` so users must explicitly opt in to persistence.
- Add a brief warning near the checkbox explaining that the token will be stored in the browser.

---

### 2. Token Stored in Plain Text (XSS Exposure)

**Severity**: Medium
**File**: `src/stores/deployStore.ts:107-116`

When `rememberToken` is true, the raw PAT string is stored unencrypted in `localStorage`. Any XSS vulnerability on the same origin would allow an attacker to read `localStorage.getItem('gh-aw-deploy')` and extract the token. Since this is a GitHub Pages site, the attack surface includes any other code running on the `githubnext.github.io` origin.

**Note**: Client-side encryption wouldn't provide real protection against XSS (since the decryption key must also be in JS). The primary mitigation is preventing XSS and minimizing persistence.

**Recommendation**:
- Keep `rememberToken` off by default (see finding #1).
- Use `sessionStorage` instead of `localStorage` when `rememberToken` is false — currently the token is held only in Zustand memory, which is correct. Verify this stays the case.
- Add a "Clear saved token" option accessible from the UI at all times (not just during the auth step).
- Consider using the `partialize` function to exclude the token entirely and re-prompt each session, storing only the username for UX convenience.

---

### 3. Inconsistent URL Encoding in API Client

**Severity**: Medium
**File**: `src/utils/githubApi.ts:44-57, 88`

`createOrUpdateFile` correctly uses `encodeURIComponent()` for `owner` and `repo` in the URL path (line 88), but `getRepo` (line 45), `getDefaultBranchSha` (line 57), `createBranch` (line 68), and `createPullRequest` (line 109) do **not** encode these parameters. If a user enters a malformed repo slug (e.g., containing `/`, `?`, `#`, or `..`), the resulting URL could resolve to an unintended API endpoint.

**Example**: A repo slug of `owner/repo/../../orgs/secret-org` would produce an API call to an unintended endpoint.

**Recommendation**:
- Apply `encodeURIComponent()` to all user-supplied path segments (`owner`, `repo`, `branch`) in every API function.
- Alternatively, add a single validation function for repo slug format (`^[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+$`) and call it before any API calls.

---

### 4. No Client-Side Input Validation on Repo Slug

**Severity**: Medium
**File**: `src/components/Deploy/RepoSelector.tsx:30`, `src/utils/deploy.ts:26`

The deploy gate is simply `repoSlug.includes('/')` (RepoSelector.tsx:30), and the split is an unchecked `repoSlug.split('/')` (deploy.ts:26). This permits values like `/`, `a/b/c/d`, `../..`, or strings with special characters. These values propagate directly into GitHub API URLs.

**Recommendation**:
- Validate the repo slug with a regex: `^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$`
- Show a validation error in the UI if the format doesn't match.
- Ensure `split('/')` produces exactly 2 non-empty segments before proceeding.

---

### 5. Branch Name Not Validated

**Severity**: Low
**File**: `src/components/Deploy/RepoSelector.tsx:20-27`, `src/utils/githubApi.ts:57,68`

The auto-derived branch name sanitizes the workflow name well (line 21-25), but the user can freely edit it afterward. Branch names containing `..`, spaces, `~`, `^`, `:`, `\`, or leading dots are invalid in git but would be sent to the API, resulting in confusing error messages. More critically, special characters could alter the URL path in `getDefaultBranchSha`.

**Recommendation**:
- Validate branch names against git ref rules (no `..`, no ASCII control chars, no `\`, no trailing `.lock`, etc.).
- Or at minimum, apply the same sanitization used for auto-generation when the user edits the field.

---

### 6. PR Body Content Injection — GitHub Actions Expression Risk

**Severity**: Medium
**File**: `src/utils/deploy.ts:87-113`

The `buildPrBody` function extracts `description` and `trigger` from user-authored markdown via regex and interpolates them directly into the PR body. If the workflow markdown contains GitHub Actions expressions like `${{ github.event.issue.title }}` in its frontmatter fields, these strings end up verbatim in the PR body.

While PR bodies themselves are not evaluated as Actions expressions, the pattern normalizes unsafe content in contexts that could be copy-pasted or referenced by workflows that read PR bodies (e.g., `${{ github.event.pull_request.body }}`).

**Recommendation**:
- Escape or strip `${{ }}` patterns from extracted values before inserting into the PR body.
- A simple replacement: `value.replace(/\$\{\{/g, '`${{`')` would render them as code literals.

---

### 7. Deprecated `unescape()` Usage

**Severity**: Low
**File**: `src/utils/githubApi.ts:93`

The expression `btoa(unescape(encodeURIComponent(content)))` uses the deprecated `unescape()` function. While this is a common pattern for UTF-8-safe base64 encoding and works correctly in all modern browsers, it may trigger linter warnings and could theoretically be removed from future browser standards.

**Recommendation**:
- Replace with a `TextEncoder`-based approach:
  ```ts
  const bytes = new TextEncoder().encode(content);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  const base64 = btoa(binary);
  ```

---

### 8. Error Messages — No Token Leakage

**Severity**: Info (Positive Finding)
**File**: `src/utils/githubApi.ts:27-30`, `src/components/Deploy/TokenSetup.tsx:36-39`

Error handling is safe. The `GitHubApiError` only includes `body.message` (from GitHub's API response) or `res.statusText` — never the token itself. The `TokenSetup` component shows generic error messages ("Invalid token", "GitHub returned {status}"). No token fragments leak into error UI or console.

---

### 9. HTTPS-Only API Communication

**Severity**: Info (Positive Finding)
**File**: `src/utils/githubApi.ts:1`

`API_BASE` is hardcoded to `https://api.github.com`. Token is transmitted only in the `Authorization` header, never in URL query parameters. This prevents token leakage in browser history, server logs, or referrer headers.

---

### 10. Token Scope Guidance

**Severity**: Info
**File**: `src/components/Deploy/TokenSetup.tsx:83`

The "Create a token" link requests `repo` and `workflow` scopes on classic PATs. These are broad scopes — `repo` grants full access to all repositories.

**Recommendation**:
- Add guidance suggesting **fine-grained PATs** as the preferred option, scoped to specific repositories with only:
  - `contents: write` (for pushing files)
  - `pull_requests: write` (for creating PRs)
  - `metadata: read` (for repo info)
- Keep classic PAT instructions as a fallback.

---

### 11. No CORS / CSRF Concerns

**Severity**: Info (Positive Finding)

This is a static SPA making direct `fetch()` calls to `api.github.com`. GitHub's CORS policy permits cross-origin requests with `Authorization` headers. There is no server-side session or cookie-based auth, so CSRF is not applicable.

---

### 12. `deployWorkflow` Not Yet Connected

**Severity**: Info
**File**: `src/utils/deploy.ts:16`

The `deployWorkflow` function is exported but not imported or called by any component. The `RepoSelector` transitions to the `'deploying'` step, but nothing triggers the actual API call sequence. This appears to be work-in-progress. When wiring this up, ensure errors are caught and don't leak token info, and that the deploy cannot be double-triggered.

---

### 13. Shared Origin Risk (GitHub Pages)

**Severity**: Low

If deployed on `githubnext.github.io`, the app shares an origin with other projects under the `githubnext` org on GitHub Pages. Any XSS in a sibling project could potentially read this app's `localStorage`. This is a platform-level concern, not a code bug.

**Recommendation**:
- Consider deploying on a custom domain for origin isolation.
- Or accept this risk given that `githubnext` controls all projects on that subdomain.

---

## Dependencies Audit

| Dependency | Version | Risk |
|---|---|---|
| `zustand` | ^5.0.11 | Low — well-maintained state library, `persist` middleware uses `localStorage` directly |
| `@radix-ui/react-dialog` | ^1.1.15 | Low — widely used, accessible dialog primitive |
| `lucide-react` | ^0.574.0 | Low — icon library, no security surface |
| `react` / `react-dom` | ^19.2.4 | Low — React auto-escapes JSX output, strong XSS protection |
| `sonner` | ^2.0.7 | Low — toast library |
| `vite` | ^7.3.1 (dev) | Low — build tool only |

No high-risk dependencies identified. The app has a small dependency surface.

---

## Recommended Mitigations (Priority Order)

1. **[Medium]** Validate repo slug format before API calls (finding #3, #4)
2. **[Medium]** Apply `encodeURIComponent()` consistently across all API functions (finding #3)
3. **[Medium]** Default `rememberToken` to `false` (finding #1)
4. **[Medium]** Escape `${{ }}` in PR body content (finding #6)
5. **[Low]** Validate branch names client-side (finding #5)
6. **[Low]** Replace deprecated `unescape()` (finding #7)
7. **[Info]** Add fine-grained PAT guidance (finding #10)
8. **[Info]** Wire up `deployWorkflow` with error boundary and double-trigger protection (finding #12)
