# Security Review: Deploy to GitHub (v2)

**Date:** 2026-02-25
**Reviewer:** security-tester (automated)
**Scope:** `githubApi.ts`, `deployStore.ts`, `deploy.ts`, `components/Deploy/*.tsx`

---

## Summary

The deploy v2 implementation is well-structured with good baseline security practices:
React JSX auto-escaping prevents XSS, `encodeURIComponent` is applied to owner/repo in URLs,
`${{ }}` expression injection is escaped in PR body content, and token persistence is opt-in.

Two medium-severity issues require code fixes. No critical or high-severity findings.

---

## Findings

### M-1: Workflow name used in file path without sanitization [MEDIUM]

**File:** `src/utils/deploy.ts:33-34`

```ts
const mdPath = `.github/workflows/${workflowName}.md`;
const ymlPath = `.github/workflows/${workflowName}.lock.yml`;
```

`workflowName` originates from user input (`workflowStore.name`) and is used to construct the
`path` parameter for the GitHub Contents API. If the name contains path traversal sequences
(e.g., `../../../README`), files could be written outside `.github/workflows/`.

While the GitHub API may normalize paths server-side, this is a defense-in-depth gap.
The name should be sanitized to allow only safe filename characters.

**Fix:** Sanitize `workflowName` before constructing paths. Strip path separators, `..`,
and restrict to `[a-zA-Z0-9._-]`.

---

### M-2: PR URL rendered as href without origin validation [MEDIUM]

**File:** `src/components/Deploy/SuccessStep.tsx:15`

```tsx
<a href={prUrl} target="_blank" rel="noopener noreferrer">
```

`prUrl` comes from the GitHub API response (`html_url`). If the API response were tampered
with (MITM, compromised proxy, or future API changes), a malicious `javascript:` or data URI
could be rendered as a clickable link.

**Fix:** Validate that `prUrl` starts with `https://github.com/` before rendering as a link.

---

### L-1: File path parameter not URL-encoded [LOW]

**File:** `src/utils/githubApi.ts:104`

```ts
`${API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}`
```

The `path` variable is not URL-encoded. Characters like `#`, `?`, or `%` in the workflow name
would break the URL. This is partially mitigated by M-1's fix (restricting characters in the
name), but the path segments should also be encoded for correctness.

**Fix:** Encode individual path segments of `path` while preserving `/` separators.

---

### L-2: Token stored in plaintext localStorage [LOW]

**File:** `src/stores/deployStore.ts:148-161`

When "Remember this token" is checked, the PAT is persisted to `localStorage` under key
`gh-aw-deploy` in plaintext. Any XSS vulnerability in the page (or browser extensions with
page access) could exfiltrate the token.

**Mitigating factors:** Opt-in only, React auto-escaping reduces XSS risk, and this is the
standard pattern for client-side token storage without a backend.

**Recommendation:** Document the risk clearly to users. Consider adding a warning in the UI.
No code fix required.

---

### L-3: Branch name validation incomplete [LOW]

**File:** `src/components/Deploy/RepoStep.tsx:10`

```ts
const BRANCH_INVALID = /(\.\.|[ ~^:\\]|\.lock$)/;
```

Missing checks: leading/trailing `/`, leading `-`, names starting with `.`, names containing
`@{`. These are rejected by git but would only fail at the GitHub API level, producing a
less clear error message.

**Recommendation:** Add additional checks or improve the error message for API rejections.
Low priority since GitHub API enforces these rules.

---

### L-4: GitHub API error messages may leak internal details [LOW]

**File:** `src/utils/githubApi.ts:32-33`

```ts
const msg = (body as { message?: string }).message || res.statusText;
```

Raw GitHub API error messages are captured. The `deploy.ts` error handler (lines 136-148)
already replaces messages for common status codes (401, 403, 404) with user-friendly text,
which is good. Remaining edge cases (422, 500, etc.) pass through the raw API message.

**Mitigating factors:** GitHub API messages are generally safe for end users.
No code fix required.

---

## Positive Findings

| Area | Assessment |
|------|-----------|
| XSS prevention | React JSX auto-escaping used throughout. No `dangerouslySetInnerHTML`. |
| URL injection | `encodeURIComponent` on owner/repo in all API URLs. |
| Expression injection | `escapeGitHubExpressions()` neutralizes `${{ }}` in PR body. |
| Token lifecycle | 401 clears token automatically. `clearToken` resets all auth state. |
| Input validation | Repo slug regex and branch name checks prevent most bad inputs. |
| Error handling | User-friendly messages for common failures. No stack traces leaked. |
| Token input | Uses `type="password"` to prevent shoulder surfing. |

---

## Recommended Fixes (ordered by priority)

1. **M-1** — Sanitize `workflowName` in `deploy.ts` before path construction
2. **M-2** — Validate `prUrl` origin in `SuccessStep.tsx`
3. **L-1** — Encode path segments in `createOrUpdateFile` URL
