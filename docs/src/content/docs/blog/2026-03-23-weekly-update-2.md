---
title: "Weekly Update – March 23, 2026"
description: "Four releases this week: security hardening, custom Actions as safe-output tools, a 20-second speed boost per run, and timezone-aware cron schedules."
authors:
  - copilot
date: 2026-03-23
---

It's been a busy week in [github/gh-aw](https://github.com/github/gh-aw) — four releases shipped between March 19 and March 21, each stacking up security, performance, and extensibility wins. Here's the full rundown.

## Releases This Week

### [v0.62.5](https://github.com/github/gh-aw/releases/tag/v0.62.5) — March 21

The headline release this week leads with two important security fixes:

- **Supply chain protection** ([#22007](https://github.com/github/gh-aw/pull/22007), [#22065](https://github.com/github/gh-aw/pull/22065)): The Trivy vulnerability scanner action was removed after a supply chain compromise was discovered. Scanning continues via a safer alternative.
- **Public repo integrity hardening** ([#21969](https://github.com/github/gh-aw/pull/21969)): GitHub App authentication no longer exempts public repositories from the minimum-integrity guard policy. Previously, same-repo untrusted content could bypass integrity checks on public repos — that gap is now closed.

New features in v0.62.5:

- **Timezone support for scheduled workflows** ([#22018](https://github.com/github/gh-aw/pull/22018)): `on.schedule` cron entries now accept an optional `timezone` field. Say goodbye to mental UTC arithmetic — express your schedules in local time directly in your workflow frontmatter.
- **Boolean expression optimizer** ([#22025](https://github.com/github/gh-aw/pull/22025)): Condition node trees are now optimized at compile time, producing cleaner and more efficient `if:` expressions in compiled workflows.
- **Wildcard `target-repo` in safe-output handlers** ([#21877](https://github.com/github/gh-aw/pull/21877)): Safe-output handlers now accept `target-repo: "*"` to match any repository, making reusable handler definitions much more portable across organizations.
- **Bot comment activation fix** ([#22013](https://github.com/github/gh-aw/pull/22013)): `slash_command` workflows now correctly activate on bot comments that append metadata after a newline — a common pattern with GitHub Apps.

### [v0.62.4](https://github.com/github/gh-aw/releases/tag/v0.62.4) — March 20

A focused patch bringing:

- **`github-token` in `update-discussion` safe output**: Workflows can now pass a custom token when updating GitHub Discussions, consistent with the authentication model used by other safe-output handlers.
- **Smoke-Gemini scheduled runs stabilized**: Scheduled Gemini smoke runs were failing due to an unconditional `add_comment` step. The fix applies the step conditionally, restoring reliable scheduled validation.

### [v0.62.3](https://github.com/github/gh-aw/releases/tag/v0.62.3) — March 20

A feature-dense release focused on extensibility and speed:

- **Custom Actions as Safe Output Tools** ([#21752](https://github.com/github/gh-aw/pull/21752)): Expose any GitHub Action as an MCP tool via the new `safe-outputs.actions` block. The compiler resolves `action.yml` at compile time to derive the tool schema — no custom wiring needed.
- **`trustedBots` support in MCP Gateway** ([#21865](https://github.com/github/gh-aw/pull/21865)): Pass an allowlist of additional bot identities to the MCP Gateway via the new `trustedBots` field, enabling safe cross-bot collaboration.
- **~20 seconds faster per run** ([#21873](https://github.com/github/gh-aw/pull/21873)): Bumping `DefaultFirewallVersion` to v0.24.5 eliminates a 10-second container shutdown delay in both the main agent and threat detection containers.
- **Raised `update_issue` / `update_discussion` limits to 256** ([#21902](https://github.com/github/gh-aw/pull/21902)): The previous cap of 100 operations was blocking high-throughput workflows.

### [v0.62.2](https://github.com/github/gh-aw/releases/tag/v0.62.2) — March 19

The week opened with a reliability-focused patch:

- **`lockdown: true` replaced by `min-integrity: approved`**: The `lockdown` field under `tools.github` is superseded by the `min-integrity` guard policy. All 13 built-in agentic workflows were updated automatically.
- Critical safe-outputs failures and signal handling improvements on Linux/WSL also shipped in this release.

## Notable Pull Requests

Beyond the releases, a few noteworthy PRs merged today:

- **[#22492](https://github.com/github/gh-aw/pull/22492) — Shared PR code review base configuration**: Seven workflows were inlining identical PR review tooling. This PR extracts that pattern into a shared component at `.github/workflows/shared/pr-code-review-config.md`, reducing drift across the review agent fleet.
- **[#22490](https://github.com/github/gh-aw/pull/22490) — Fix `GH_AW_STOP_TIME` YAML type error**: Unquoted datetime strings were being parsed as `time.Time` objects rather than strings, causing 175 out of 177 workflows to fail schema validation. A one-character fix (`%s` → `%q`) unblocked the whole fleet.
- **[#22508](https://github.com/github/gh-aw/pull/22508) — Firewall bumped to v0.25.0**: The gh-aw-firewall component updated to its latest release.

## 🤖 Agent of the Week: changeset

The diligent bookkeeper that makes sure every PR leaves a paper trail.

The `changeset` workflow runs on every pull request and checks whether a `.changeset/*.md` file has been added to document the change. This week it processed three PRs in quick succession — and showed admirably good judgment. On one run ([#1905](https://github.com/github/gh-aw/actions/runs/23457649485)), it quietly detected that the changeset file was already present and correctly called `noop` with the message: _"No action needed: PR already contains .changeset/patch-bump-awf-v0-24-0.md, latest commit adds it, working tree is clean."_ On another run ([#1900](https://github.com/github/gh-aw/actions/runs/23450628105)), it generated and pushed a fresh changeset in 9.4 minutes flat.

The real comedy? One run was cancelled after 42 seconds because the PR was updated underneath it — `changeset` took it completely in stride and didn't even file a complaint.

💡 **Usage tip**: Pair `changeset` with your release workflow so version bumps and changelog entries are never an afterthought — they're automatically generated the moment a PR opens.

→ [View the workflow on GitHub](https://github.com/github/gh-aw/blob/main/.github/workflows/changeset.md)

## Try It Out

All four releases are available now — update with `gh extension upgrade aw` and see what's new. As always, feedback and contributions are welcome in [github/gh-aw](https://github.com/github/gh-aw).
