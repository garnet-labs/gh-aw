# Security Review — Visual Workflow Editor

**Reviewer**: Security Review Agent
**Date**: 2026-02-19
**Scope**: All source files in `docs/editor-app/src/`
**Overall Risk**: LOW

---

## Summary

The visual editor is a client-side-only React SPA with no backend, no authentication, and no network requests. All compilation happens via WASM in a Web Worker. The attack surface is minimal. No critical or high-severity issues found.

---

## 1. XSS Risk Assessment

**Status**: PASS

- **No `dangerouslySetInnerHTML`** usage found anywhere in the codebase.
- All user inputs (workflow name, instructions, domain names, trigger config) are rendered as React text content, which is auto-escaped by React's JSX rendering.
- The Instructions node preview (`InstructionsNode.tsx:31`) renders text with `whiteSpace: pre-wrap` — safe, no HTML interpretation.
- YAML/Markdown preview panels use `prism-react-renderer`, which tokenizes and renders via `<span>` elements — no raw HTML injection path.
- Template names and descriptions are hardcoded constants (`templates.ts`), not user-supplied.

## 2. Input Sanitization

**Status**: PASS with minor notes

- **Domain inputs** (`NetworkPanel.tsx`): Only validates for empty/whitespace and duplicates. Does not validate domain format (e.g., rejects nothing like `"><script>alert(1)</script>`). However, this is a **non-issue** because:
  - The domain string is only used to generate markdown text output
  - It's properly YAML-quoted via `yamlString()` in `markdownGenerator.ts:301-313`
  - No network calls are ever made to these domains from the editor
- **YAML generation** (`markdownGenerator.ts`): The `yamlString()` function properly escapes special YAML characters (`:#{}[]|>!%@` etc.) and wraps in double quotes when needed. Backslashes and double quotes are escaped. This prevents YAML injection.
- **Workflow name**: Used as a filename in export (`Header.tsx:79`). The name is sanitized via Blob download (browser handles filename safety). No path traversal risk since it's a client-side download.

## 3. WASM / Compiler Bridge Security

**Status**: PASS

- **Dynamic import path** (`compiler.ts:20-21`): Uses `/* @vite-ignore */` dynamic import with `wasmBasePath` parameter. This path is hardcoded as `'/gh-aw/wasm/'` in `App.tsx:33` — **not user-controllable**.
- **Worker communication**: The `compile()` function sends markdown strings to the Web Worker via `postMessage`. The response is typed via `CompileResult` interface. No arbitrary code execution path.
- **WASM isolation**: The Go WASM binary runs in a Web Worker, isolated from the main thread's DOM. Even if the WASM binary had a vulnerability, it cannot access the page's DOM or user data directly.

## 4. LocalStorage Usage

**Status**: PASS

Two Zustand stores persist to `localStorage`:

| Store Key | Data Stored | Sensitive? |
|-----------|-------------|------------|
| `workflow-editor-state` | Workflow config: name, trigger, engine, tools, instructions, network domains, permissions, safe outputs | No |
| `workflow-editor-ui` | UI preferences: theme, sidebar state, onboarding flag, auto-compile toggle, disclosure level | No |

- **No secrets, tokens, API keys, or credentials** are stored.
- The `partialize` option in `workflowStore.ts:219-234` correctly excludes transient UI state (`selectedNodeId`, `compiledYaml`, `error`, etc.) from persistence.
- User-authored instruction text is stored, which could theoretically contain sensitive content, but this is user-controlled and expected behavior for a local editor.

**Note**: No handling for `localStorage` being unavailable (e.g., private browsing mode). Zustand's `persist` middleware silently falls back, so this won't crash, but state won't persist.

## 5. Dependency Audit

**Status**: PASS

```
$ npm audit
found 0 vulnerabilities
```

All dependencies are well-known, actively maintained packages:
- React 19, Zustand 5, Vite 7 — current major versions
- `@xyflow/react` v12, `@primer/react` v38, `@radix-ui/*` — established UI libraries
- `prism-react-renderer` v2 — syntax highlighting (no eval/code execution)
- `framer-motion` v12, `sonner` v2, `lucide-react` — UI utilities
- `@dagrejs/dagre` v2 — graph layout algorithm (pure computation)

No transitive vulnerabilities detected.

## 6. CSP Compatibility

**Status**: PASS with one note

- **No inline scripts** in `index.html`. The entry point uses `<script type="module" src="/src/main.tsx">`.
- **Inline styles**: The codebase extensively uses React's `style` prop (e.g., `Header.tsx`, `TriggerPanel.tsx`). These set the `style` attribute on DOM elements, which does **not** violate `style-src` CSP directives (only `<style>` tags and `style` attributes with dynamic values in some strict CSP configs could be an issue).
- **CSS `@keyframes`**: Defined in `globals.css:112-115` — served as a stylesheet, CSP-safe.
- **`document.execCommand('copy')`**: Used as a fallback in `YamlPreview.tsx:31-34`. This is deprecated but not a security concern. The primary path uses `navigator.clipboard.writeText()`.
- **Note**: The `color-mix()` CSS function used in several places requires modern browser support but has no security implications.

## 7. Additional Observations

### No Network Requests
The editor makes **zero** fetch/XHR/WebSocket calls. All processing is local (WASM compilation, state management, UI rendering). There is no SSRF, CSRF, or data exfiltration risk.

### No Authentication
No login, session tokens, or user identity is involved. The editor is a stateless tool.

### React Flow License
`WorkflowGraph.tsx:228` uses `proOptions: { hideAttribution: true }`. This requires a React Flow Pro license. Not a security issue, but a compliance/licensing consideration.

### File Download Safety
Export functionality (`Header.tsx:78-87`) creates Blob URLs and triggers downloads. The browser's native download mechanism handles filename sanitization. No path traversal or file overwrite risk.

---

## Recommendations

1. **(Low priority)** Add basic domain format validation in `NetworkPanel.tsx` — regex check for valid hostname pattern (e.g., `/^[a-zA-Z0-9*][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/`). Prevents confusing output, not a security risk.
2. **(Low priority)** Add a React Error Boundary component to prevent white-screen crashes from propagating. Currently, any unhandled render error will crash the entire app.
3. **(Informational)** Consider adding a `<meta http-equiv="Content-Security-Policy">` tag to `index.html` for defense-in-depth, since the editor will be served from GitHub Pages.
4. **(Informational)** Verify React Flow Pro license compliance for the `hideAttribution` option.

---

## Conclusion

The visual editor has a minimal attack surface. It is a client-side SPA with no backend, no network requests, no authentication, and no sensitive data storage. All user inputs are safely rendered via React's built-in escaping. YAML output is properly quoted. The WASM compiler runs in an isolated Web Worker. No vulnerabilities found.
