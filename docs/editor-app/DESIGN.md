# Visual Agentic Workflow Editor - Design Specification

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Layout Design](#2-layout-design)
3. [Visual Flow Graph Design](#3-visual-flow-graph-design)
4. [Property Panel Designs](#4-property-panel-designs)
5. [Color System & Theme](#5-color-system--theme)
6. [Interactions & Animations](#6-interactions--animations)
7. [Component Specifications](#7-component-specifications)
8. [Onboarding Design](#8-onboarding-design)

---

## 1. Design Philosophy

**Target Users**: Business analysts, product managers, team leads - people who understand *what* they want an AI agent to do but shouldn't need to write YAML.

**Core Principles**:
- **Visual-first**: Every concept has a visual representation. No raw text editing required.
- **Progressive disclosure**: Show the simplest view by default; advanced options are one click away.
- **Safe defaults**: Pre-fill smart defaults so users can create working workflows with minimal input.
- **Immediate feedback**: Compile in real-time so users see results as they build.

**Mental Model**: A workflow is a visual pipeline: *"When X happens, use Y engine with Z tools to follow these instructions, then produce these outputs."* Each concept is a card (node) on a canvas, connected by lines showing the flow.

---

## 2. Layout Design

### 2.1 Overall Layout

```
+------------------------------------------------------------------+
|  [Logo]  Workflow Name   [Status]     [Theme] [Compile] [Export]  |  <- Header (48px)
+----------+-----------------------------------+--------------------+
|          |                                   |                    |
| SIDEBAR  |          CANVAS                   |    PROPERTIES      |
| (240px)  |         (flex)                    |     (360px)        |
|          |                                   |                    |
| [Nodes]  |   +-------+     +--------+       | [Form fields for   |
| [Search] |   |Trigger |---->|Engine  |       |  selected node]    |
|          |   +-------+     +--------+       |                    |
| Trigger  |                    |              |                    |
| Engine   |              +--------+           |                    |
| Tools    |              | Tools  |           |                    |
| Instruct |              +--------+           |                    |
| Outputs  |                    |              |                    |
| Network  |              +--------+           |                    |
| Perms    |              |Outputs |           |                    |
|          |              +--------+           |                    |
|          |                                   |                    |
+----------+-----------------------------------+--------------------+
|  [Zoom: -/+/Fit]  [Minimap]       [YAML Preview Toggle]          |  <- Footer bar (32px)
+------------------------------------------------------------------+
```

### 2.2 Header Bar

```
+------------------------------------------------------------------+
| [>_] gh-aw  |  my-workflow.md  [*]  |  Ready   | [D] [Compile] [v] |
+------------------------------------------------------------------+
  ^              ^               ^       ^          ^     ^        ^
  Logo          Name (editable)  Dirty   Status    Theme  Button  Export
                                 dot     badge     toggle         dropdown
```

- **Height**: 48px
- **Background**: `--bgColor-default` (Primer)
- **Border**: 1px bottom border `--borderColor-default`
- **Logo**: Terminal icon `>_` in accent color, links back to docs. 20x20px.
- **Workflow Name**: Inline-editable text field, `font-size: 14px`, `font-weight: 600`. Click to edit, blur to save.
- **Dirty Indicator**: Small 6px circle, `--fgColor-attention` (amber), appears when unsaved changes exist.
- **Status Badge**: Primer `Label` component:
  - `Label--success` + green dot: "Ready"
  - `Label--accent` + pulsing dot: "Compiling..."
  - `Label--danger` + red dot: "Error"
- **Theme Toggle**: `btn-octicon` with sun/moon icon. 32x32px hit target.
- **Compile Button**: Primer `btn btn-primary btn-sm`. Play icon + "Compile" text.
- **Export Dropdown**: `btn btn-sm` with caret. Options: "Download .md", "Download .lock.yml", "Copy YAML", "Open in Playground".

### 2.3 Sidebar (Node Palette)

```
+-----------+
| PALETTE   |
+-----------+
| [Search]  |   <- Filter nodes
+-----------+
|           |
| [*] Trigg |   <- Draggable node cards
| [B] Engin |
| [W] Tools |
| [D] Instr |
| [M] Outpu |
| [G] Netwo |
| [S] Perms |
|           |
+-----------+
| TEMPLATES |   <- Expandable section
+-----------+
| PR Review |
| Issue Tri |
| Code Scan |
+-----------+
```

- **Width**: 240px (collapsible to 48px icon-only rail)
- **Background**: `--bgColor-default`
- **Border**: 1px right border
- **Search**: Primer `TextInput` with search icon, `font-size: 13px`, 8px padding
- **Node Cards**:
  - Dimensions: 208px wide x 56px tall
  - Border-radius: 8px
  - Left accent bar: 3px wide, colored by node type
  - Icon: 20x20px, left-aligned
  - Label: `font-size: 13px`, `font-weight: 500`
  - Subtitle: `font-size: 11px`, `color: --fgColor-muted`
  - Cursor: `grab` on hover
  - On drag start: opacity 0.6, show ghost card following cursor
- **Collapse Button**: Chevron icon at top-right of sidebar. Sidebar collapses to 48px rail showing only icons.
- **Templates Section**: Collapsible accordion. Each template is a pre-built workflow graph that can be dragged onto the canvas.

### 2.4 Canvas (Center)

- **Flex**: Takes all remaining horizontal space
- **Background**: Dot grid pattern (dots spaced 20px apart)
  - Light mode: dots `rgba(0,0,0,0.06)` on `#ffffff`
  - Dark mode: dots `rgba(255,255,255,0.04)` on `#0d1117`
- **Pan**: Middle-click drag or Space+drag
- **Zoom**: Scroll wheel, range 25%-200%, default 100%
- **Selection**: Click node to select (blue outline), click canvas to deselect
- **Multi-select**: Shift+click or drag selection rectangle

### 2.5 Properties Panel (Right)

- **Width**: 360px (collapsible)
- **Background**: `--bgColor-default`
- **Border**: 1px left border
- **Header**: Selected node type icon + name, 40px height
- **Content**: Scrollable form area below header
- **Empty State**: "Select a node to edit its properties" with pointer illustration
- **Collapse**: Click the `<<` button to hide panel; a `>>` tab appears on the right edge

### 2.6 Footer Bar

```
+------------------------------------------------------------------+
| [-] 100% [+] [Fit] [Minimap]              [YAML Preview: Off/On] |
+------------------------------------------------------------------+
```

- **Height**: 32px
- **Background**: `--bgColor-subtle`
- **Zoom Controls**: `-` / percentage / `+` / "Fit" button. All `btn-octicon` style.
- **Minimap Toggle**: Small rectangle icon, opens a 160x120px minimap overlay in bottom-right of canvas.
- **YAML Preview Toggle**: Slide toggle. When enabled, a bottom drawer slides up showing the compiled YAML (read-only, syntax-highlighted).

---

## 3. Visual Flow Graph Design

### 3.1 Node Anatomy

Every node follows the same base structure:

```
+--+---------------------------------------+
|  |  [Icon]  Node Title                   |
|  |  subtitle / preview text              |
|  +---------------------------------------+
|AC|          Node-specific content         |
|  |          (badges, chips, preview)      |
+--+---------------------------------------+
  ^
  Accent bar (3px, node-type color)
```

- **Base dimensions**: 260px wide, variable height (min 64px)
- **Border-radius**: 12px
- **Border**: 1px solid `--borderColor-default`
- **Shadow**: `0 1px 3px rgba(0,0,0,0.08)` (light), `0 1px 3px rgba(0,0,0,0.3)` (dark)
- **Background**: `--bgColor-default`
- **Accent bar**: 3px left border, colored by node type
- **Title**: `font-size: 13px`, `font-weight: 600`
- **Subtitle**: `font-size: 11px`, `color: --fgColor-muted`, max 1 line, ellipsis overflow

### 3.2 Connection Lines (Edges)

- **Style**: Bezier curves with smooth entry/exit
- **Color**: `--borderColor-default` (idle), `--fgColor-accent` (active/selected)
- **Width**: 2px
- **Arrow**: Small chevron at target end, 8px
- **Animation on creation**: Line draws from source to target over 200ms

### 3.3 Node Type Designs

#### 3.3.1 Trigger Node

```
+--+---------------------------------------+
|  |  [Zap]  Trigger                       |
|  |  When this happens...                 |
|G |---------------------------------------+
|R |                                        |
|E |  +------------------+                  |
|E |  | issue_comment    |  [opened]        |
|N |  +------------------+                  |
|  |  Schedule: every Monday 9am            |
+--+---------------------------------------+
```

- **Accent**: `#2da44e` (green-500)
- **Icon**: Zap/lightning bolt, 18x18px, filled green
- **Content**:
  - Event type shown as a Primer `Label` badge
  - Activity types shown as small gray `Label--secondary` badges
  - Schedule displayed as human-readable text (converted from cron)
  - If `workflow_dispatch`: shows "Manual trigger" with play button icon
- **Handles**: Single output handle on the right edge (small 8px circle)

#### 3.3.2 Permissions Node

```
+--+---------------------------------------+
|  |  [Shield]  Permissions                |
|Y |  Token access levels                  |
|E |---------------------------------------+
|L |                                        |
|L |  [issues: write]  [contents: read]     |
|O |  [pull-requests: write]  [metadata: R] |
|W |  [models: read]                        |
|  |                                        |
+--+---------------------------------------+
```

- **Accent**: `#d4a72c` (yellow-600)
- **Icon**: Shield with checkmark, 18x18px
- **Content**:
  - Permission badges in a flex-wrap grid
  - Each badge: `Label` with colored variant
    - `write`: `Label--attention` (amber background)
    - `read`: `Label--success` (green background)
    - `none`: `Label--secondary` (gray, dimmed)
  - Format: `scope: level` (e.g., "issues: write")
  - If `read-all` or `write-all` shorthand: single large badge
- **Handles**: Input on left, output on right

#### 3.3.3 Engine Node

```
+--+---------------------------------------+
|  |  [Brain]  Engine                      |
|B |  AI processor                         |
|L |---------------------------------------+
|U |                                        |
|E |  +------+  Claude                      |
|  |  | LOGO |  Model: claude-sonnet-4-...  |
|  |  +------+  Max turns: 10              |
|  |                                        |
+--+---------------------------------------+
```

- **Accent**: `#0969da` (blue-500)
- **Icon**: Brain/sparkle, 18x18px
- **Content**:
  - Engine logo (24x24px): Claude (purple anthropic icon), Copilot (GitHub Copilot icon), Codex (OpenAI icon)
  - Engine name in bold: "Claude", "Copilot", or "Codex"
  - Model shown below in muted text (if set)
  - Max turns shown as a small detail
  - If custom engine: shows "Custom" with gear icon
- **Handles**: Input on left, output on right

#### 3.3.4 Tools Node

```
+--+---------------------------------------+
|  |  [Wrench]  Tools                      |
|P |  MCP servers & capabilities           |
|U |---------------------------------------+
|R |                                        |
|P |  [GH] GitHub   [PW] Playwright         |
|L |  [B] Bash      [E] Edit               |
|E |  [WF] Web Fetch  [S] Serena            |
|  |                                        |
+--+---------------------------------------+
```

- **Accent**: `#8250df` (purple-500)
- **Icon**: Wrench, 18x18px
- **Content**:
  - Tool chips in a flex-wrap grid
  - Each chip: rounded pill shape (border-radius: 12px)
    - 16x16px icon on left (tool-specific icon)
    - Tool name text, `font-size: 12px`
    - Background: light purple tint `rgba(130,80,223,0.08)`
  - Tool-specific icons:
    - GitHub: Octocat mark
    - Bash: Terminal `>_`
    - Playwright: Drama mask
    - Edit: Pencil
    - Web Fetch: Globe with arrow
    - Web Search: Magnifying glass
    - Serena: Code brackets
    - Cache Memory: Database
    - Repo Memory: Git branch
- **Handles**: Input on left, output on right

#### 3.3.5 Instructions Node

```
+--+---------------------------------------+
|  |  [Doc]  Instructions                  |
|G |  Mission & context for the agent      |
|R |---------------------------------------+
|A |                                        |
|Y |  # Mission                             |
|  |  Review the pull request for           |
|  |  security issues and suggest...        |
|  |  ~~~                                   |
+--+---------------------------------------+
```

- **Accent**: `#57606a` (gray-500)
- **Icon**: Document/file text, 18x18px
- **Content**:
  - Rendered markdown preview (first ~4 lines)
  - Monospace font, `font-size: 12px`, `line-height: 1.5`
  - Overflow: fade-to-background gradient at bottom
  - Click opens full markdown editor in Properties panel
- **Handles**: Input on left, output on right

#### 3.3.6 Safe Outputs Node

```
+--+---------------------------------------+
|  |  [Megaphone]  Safe Outputs            |
|G |  What the agent can produce           |
|R |---------------------------------------+
|E |                                        |
|E |  [+] add-comment    [+] create-issue   |
|N |  [+] add-labels     [+] create-pr      |
|  |  [+] submit-review                     |
|  |                                        |
+--+---------------------------------------+
```

- **Accent**: `#1a7f37` (green-600)
- **Icon**: Megaphone/broadcast, 18x18px
- **Content**:
  - Output type badges in flex-wrap grid
  - Each badge: Primer `Label--success` with `+` icon prefix
  - Human-readable names (hyphenated): "add-comment", "create-issue", "create-pr"
  - Badge count shown in node title area: "Safe Outputs (5)"
- **Handles**: Input on left (no output - terminal node)

#### 3.3.7 Network Node

```
+--+---------------------------------------+
|  |  [Globe]  Network                     |
|R |  Egress control & firewall            |
|E |---------------------------------------+
|D |                                        |
|  |  Allowed: 5 domains                    |
|  |  [github.com] [api.anthropic.com]      |
|  |  [pypi.org] +2 more                    |
|  |  Firewall: AWF v0.13.5                 |
+--+---------------------------------------+
```

- **Accent**: `#cf222e` (red-500)
- **Icon**: Globe with shield overlay, 18x18px
- **Content**:
  - "Allowed: N domains" summary line
  - First 2-3 domain chips shown, `+N more` overflow indicator
  - Domain chips: monospace font, `font-size: 11px`, gray background
  - Firewall status line if configured
  - If `network: defaults`: shows "Defaults" badge
- **Handles**: Input on left, output on right

### 3.4 Default Flow Layout

When creating a new workflow, nodes auto-arrange in this vertical order:

```
  +----------+
  | Trigger  |  (always first - defines "when")
  +----------+
       |
  +----------+
  | Perms    |  (what access the workflow has)
  +----------+
       |
  +----------+
  | Engine   |  (which AI processes it)
  +----------+
       |
  +----------+
  | Tools    |  (what tools the AI can use)
  +----------+
       |
  +----------+
  | Instruct |  (what the AI should do)
  +----------+
       |
  +----------+
  | Outputs  |  (what the AI can produce)
  +----------+
       |
  +----------+
  | Network  |  (network restrictions)
  +----------+
```

Edges connect each node to the next automatically. The user can rearrange freely, but this is the default.

---

## 4. Property Panel Designs

When a node is selected, the Properties panel shows a form specific to that node type.

### 4.1 Common Panel Structure

```
+--------------------------------------------+
| [NodeIcon] Node Type Name          [X]     |  <- Panel header (40px)
+--------------------------------------------+
| [Tab1] [Tab2] [Tab3]                       |  <- Optional tabs
+--------------------------------------------+
|                                             |
|  Section Header                             |
|  ----------------------------------------  |
|  Field Label [?]                            |
|  [Input / Selector / Toggle]                |
|                                             |
|  Field Label [?]                            |
|  [Input / Selector / Toggle]                |
|                                             |
|  > Advanced Options                         |  <- Collapsible section
|                                             |
+--------------------------------------------+
```

- **Panel header**: 40px, node icon + type name + close button
- **Section headers**: `font-size: 12px`, `font-weight: 600`, uppercase, `letter-spacing: 0.5px`, `color: --fgColor-muted`. 1px bottom border.
- **Field labels**: `font-size: 13px`, `font-weight: 500`. Inline `[?]` tooltip icon.
- **Tooltips**: On `[?]` hover, show a Primer `Tooltip` with plain-English explanation. Max width 280px.
- **Spacing**: 16px padding, 12px gap between fields, 20px gap between sections
- **Scrolling**: Panel body scrolls independently of header

### 4.2 Trigger Node Properties

```
+--------------------------------------------+
| [Zap] Trigger                       [X]    |
+--------------------------------------------+
|                                             |
|  Event Type                                 |
|  ----------------------------------------  |
|  Choose what triggers this workflow [?]     |
|                                             |
|  +------------------+  +------------------+ |
|  | [Chat] Issue     |  | [PR]  Pull       | |
|  |   Comment        |  |   Request        | |
|  +------------------+  +------------------+ |
|  +------------------+  +------------------+ |
|  | [Cal] Schedule   |  | [Zap] Push       | |
|  +------------------+  +------------------+ |
|  +------------------+  +------------------+ |
|  | [Play] Manual    |  | [Tag] Release    | |
|  +------------------+  +------------------+ |
|  +------------------+  +------------------+ |
|  | [Slash] Slash    |  | [Bug] Issues     | |
|  |  Command         |  |                  | |
|  +------------------+  +------------------+ |
|                                             |
|  Activity Types [?]                         |
|  (shown dynamically after event selection)  |
|  [x] opened  [x] edited  [ ] closed        |
|  [ ] reopened  [ ] labeled                  |
|                                             |
|  > Conditional Execution                    |
|    ---------------------------------------- |
|    Skip Roles [?]                           |
|    [Tag input: admin, write, ...]           |
|                                             |
|    Skip Bots [?]                            |
|    [Tag input: dependabot, ...]             |
|                                             |
|    Skip If Match [?]                        |
|    [Text input: GitHub search query]        |
|                                             |
|  > Reactions & Status                       |
|    ---------------------------------------- |
|    Reaction [?]                             |
|    [Emoji picker: +1 -1 heart rocket ...]   |
|                                             |
|    Status Comment [?]                       |
|    [Toggle: On/Off]                         |
|                                             |
|  > Manual Approval                          |
|    ---------------------------------------- |
|    Environment [?]                          |
|    [Text input: environment name]           |
|                                             |
+--------------------------------------------+
```

**Event Type Selector**:
- 2-column grid of selectable cards
- Each card: ~152px wide, 56px tall
- Icon (24x24) + event name
- Border: 1px solid `--borderColor-default`
- Selected: 2px solid `--fgColor-accent`, light accent background
- Hover: `--bgColor-subtle`

**Event cards and their icons**:
| Event | Icon | Label |
|-------|------|-------|
| `issue_comment` | Chat bubble | Issue Comment |
| `pull_request` | Git merge | Pull Request |
| `schedule` | Calendar/clock | Schedule |
| `push` | Arrow up | Push |
| `workflow_dispatch` | Play circle | Manual |
| `release` | Tag | Release |
| `slash_command` | Forward slash | Slash Command |
| `issues` | Circle dot | Issues |
| `discussion` | Discussion bubble | Discussion |
| `pull_request_review` | Eye | PR Review |

**Activity Types**:
- Checkbox grid, shown dynamically based on selected event type
- Pre-checked with common defaults (e.g., "opened" for issues)
- Maps to the event's `types:` field

**Schedule Input** (when Schedule event selected):
- Natural language input: "every Monday at 9am"
- Shows converted cron expression below in muted monospace
- Preset buttons: "Hourly", "Daily", "Weekly", "Monthly"

**Reaction Selector**:
- Horizontal row of clickable emoji icons
- Options: +1, -1, laugh, confused, heart, hooray, rocket, eyes, none
- Selected reaction gets accent ring
- Maps to `on.reaction` field

### 4.3 Permissions Node Properties

```
+--------------------------------------------+
| [Shield] Permissions                [X]    |
+--------------------------------------------+
|                                             |
|  Quick Setup [?]                            |
|  ----------------------------------------  |
|  Choose a preset or customize individually  |
|                                             |
|  ( ) Read All  ( ) Write All  (*) Custom    |
|                                             |
|  Permission Scopes                          |
|  ----------------------------------------  |
|                                             |
|  issues          [None | Read | Write v]    |
|  contents        [None | Read | Write v]    |
|  pull-requests   [None | Read | Write v]    |
|  discussions     [None | Read | Write v]    |
|  actions         [None | Read | Write v]    |
|  checks          [None | Read | Write v]    |
|  deployments     [None | Read | Write v]    |
|  models          [None | Read      v]       |
|  packages        [None | Read | Write v]    |
|  pages           [None | Read | Write v]    |
|  security-events [None | Read | Write v]    |
|  statuses        [None | Read | Write v]    |
|  id-token        [None |        Write v]    |
|  metadata        [None | Read | Write v]    |
|  attestations    [None | Read | Write v]    |
|                                             |
|  [Auto-detect minimum permissions]          |
|                                             |
+--------------------------------------------+
```

**Quick Setup**: Radio button group with three options. Selecting "Read All" or "Write All" disables the individual selectors and sets all to that level.

**Permission Selectors**:
- Each row: scope name (left-aligned, `font-size: 13px`) + segmented control (right-aligned)
- Segmented control: 3 options ("None", "Read", "Write") as Primer `SegmentedControl`
  - None: gray
  - Read: green tint
  - Write: amber tint
- Rows with non-default values are highlighted with subtle accent background
- Special cases:
  - `id-token`: Only shows "None" and "Write" (no Read option)
  - `models`: Only shows "None" and "Read" (no Write option)

**Smart Defaults**: Based on selected engine and tools, auto-suggest permissions:
- If tools include `github` with write actions: suggest `issues: write`, `pull-requests: write`, `contents: read`
- If engine is `copilot`: suggest `models: read`
- "Auto-detect" button analyzes the full workflow and recommends the minimum set

### 4.4 Engine Node Properties

```
+--------------------------------------------+
| [Brain] Engine                      [X]    |
+--------------------------------------------+
|                                             |
|  AI Engine [?]                              |
|  ----------------------------------------  |
|  Which AI processes your workflow           |
|                                             |
|  +-------------+ +-------------+            |
|  | [A] Claude  | | [GH] Copil |            |
|  | Anthropic   | |  ot  (Rec.)|            |
|  +-------------+ +-------------+            |
|  +-------------+ +-------------+            |
|  | [OA] Codex  | | [Gear] Cus |            |
|  | OpenAI      | |  tom       |            |
|  +-------------+ +-------------+            |
|                                             |
|  Model (optional) [?]                       |
|  [Dropdown: claude-sonnet-4-... v]          |
|  Tip: Leave blank for the latest default    |
|                                             |
|  Max Turns [?]                              |
|  [Slider: 1 ----o---------- 50]  [10]      |
|  How many iterations the agent can take     |
|                                             |
|  > Advanced                                 |
|    ---------------------------------------- |
|    Version [?]                              |
|    [Text input]                             |
|                                             |
|    Custom Command [?]                       |
|    [Text input]                             |
|                                             |
|    Additional Args [?]                      |
|    [Tag input: --flag, --verbose, ...]      |
|                                             |
|    Environment Variables [?]                |
|    [Key-Value editor]                       |
|                                             |
|    Concurrency                              |
|    Group [Text input]                       |
|    Cancel in-progress [Toggle]              |
|                                             |
+--------------------------------------------+
```

**Engine Selector**:
- 2-column grid of selectable cards (same pattern as Trigger events)
- Each card shows: engine logo (24x24) + engine name + company name
- "Copilot" card has "(Recommended)" tag
- Selected card: accent border + background tint

**Engine cards**:
| Engine | Logo | Name | Subtitle |
|--------|------|------|----------|
| `claude` | Anthropic A mark (purple) | Claude | By Anthropic |
| `copilot` | GitHub Copilot icon | Copilot | By GitHub |
| `codex` | OpenAI icon | Codex | By OpenAI |
| custom | Gear icon | Custom | Bring your own |

**Model Dropdown**:
- Shown after engine selection
- Pre-populated with known models for the selected engine:
  - Claude: claude-sonnet-4-20250514, claude-opus-4-20250514, etc.
  - Copilot: (default, managed by GitHub)
  - Codex: gpt-4, etc.
- Free-text entry allowed for custom model strings

**Max Turns Slider**:
- Range: 1-50, default 10
- Slider with numeric input box beside it
- Tooltip: "Higher values let the agent take more steps but cost more"

### 4.5 Tools Node Properties

```
+--------------------------------------------+
| [Wrench] Tools                      [X]    |
+--------------------------------------------+
|                                             |
|  Available Tools [?]                        |
|  ----------------------------------------  |
|  Toggle the tools your agent can use        |
|                                             |
|  +------------------------------------------+
|  | [GH] GitHub API           [Toggle: ON ] ||
|  | Repository operations     [Configure >]||
|  +------------------------------------------+
|  | [>_] Bash                 [Toggle: ON ] ||
|  | Shell command execution                 ||
|  +------------------------------------------+
|  | [Pencil] Edit             [Toggle: OFF] ||
|  | File reading & writing                  ||
|  +------------------------------------------+
|  | [Drama] Playwright        [Toggle: OFF] ||
|  | Browser automation        [Configure >]||
|  +------------------------------------------+
|  | [Globe] Web Fetch         [Toggle: OFF] ||
|  | Download web pages                      ||
|  +------------------------------------------+
|  | [Search] Web Search       [Toggle: OFF] ||
|  | Internet search                         ||
|  +------------------------------------------+
|  | [Code] Serena             [Toggle: OFF] ||
|  | AI code intelligence      [Configure >]||
|  +------------------------------------------+
|  | [DB] Cache Memory         [Toggle: OFF] ||
|  | Persistent storage        [Configure >]||
|  +------------------------------------------+
|  | [Git] Repo Memory         [Toggle: OFF] ||
|  | Git-based storage         [Configure >]||
|  +------------------------------------------+
|  | [AW] Agentic Workflows   [Toggle: OFF] ||
|  | Workflow introspection                  ||
|  +------------------------------------------+
|                                             |
|  > GitHub Tool Configuration                |
|    (expanded when "Configure >" is clicked) |
|    ---------------------------------------- |
|    Mode: ( ) Local  (*) Remote              |
|    Read-only: [Toggle: OFF]                 |
|    Lockdown: [Toggle: OFF]                  |
|    Allowed Functions [?]                    |
|    [Tag input: create_issue, ...]           |
|    Toolsets [?]                             |
|    [Tag input: repos, issues, ...]          |
|                                             |
|  Timeouts                                   |
|  ----------------------------------------  |
|  Operation Timeout [?]                      |
|  [Number input: 300] seconds                |
|  Startup Timeout [?]                        |
|  [Number input: 60] seconds                 |
|                                             |
+--------------------------------------------+
```

**Tool Toggle Cards**:
- Full-width list items, 52px tall
- Icon (20x20) + tool name (bold) + description (muted) on left
- Toggle switch on right
- "Configure >" link appears for tools with sub-options (GitHub, Playwright, Serena, Cache Memory, Repo Memory)
- Clicking "Configure >" expands an inline configuration section below the toggle card

**Tool list with descriptions**:
| Tool | Icon | Description | Has Config |
|------|------|-------------|------------|
| GitHub | Octocat | Repository operations (issues, PRs, content) | Yes |
| Bash | Terminal | Shell command execution | No |
| Edit | Pencil | File reading & writing | No |
| Playwright | Drama mask | Browser automation & screenshots | Yes |
| Web Fetch | Globe+arrow | Download web pages & API responses | No |
| Web Search | Magnifier | Internet search & results | No |
| Serena | Code brackets | AI code intelligence with language services | Yes |
| Cache Memory | Database | Persistent cross-run storage via cache | Yes |
| Repo Memory | Git branch | Git-based persistent storage | Yes |
| Agentic Workflows | Workflow icon | Workflow introspection & analysis | No |

**GitHub Sub-configuration** (expanded):
- Mode selector: Radio buttons "Local" / "Remote"
- Read-only toggle
- Lockdown toggle
- Allowed functions: Tag input with autocomplete from known GitHub API functions
- Toolsets: Tag input with suggestions (repos, issues, pull_requests, etc.)
- GitHub App: Optional section for app-id and private-key fields

**Playwright Sub-configuration** (expanded):
- Allowed domains: Tag input
- Version: Text input

**Cache Memory Sub-configuration** (expanded):
- Cache key: Text input
- Description: Text input
- Retention days: Number input (1-90)
- Restore only: Toggle
- Scope: Radio buttons "Workflow" / "Repo"
- Allowed extensions: Tag input

**Repo Memory Sub-configuration** (expanded):
- Branch prefix: Text input (default: "memory")
- Target repo: Text input (default: current repo)
- File glob: Tag input
- Max file size: Number input (bytes)
- Max file count: Number input

### 4.6 Instructions Node Properties

```
+--------------------------------------------+
| [Doc] Instructions                  [X]    |
+--------------------------------------------+
|  [Edit] [Preview]                          |
+--------------------------------------------+
|                                             |
|  # Mission                                 |
|                                             |
|  Review the pull request and check for:     |
|  - Security vulnerabilities                 |
|  - Code quality issues                      |
|  - Test coverage gaps                        |
|                                             |
|  ## Guidelines                              |
|                                             |
|  - Be constructive and specific              |
|  - Suggest fixes, not just problems          |
|  - Reference relevant documentation         |
|                                             |
|  1,247 / 20,000 characters                  |
|                                             |
|  > Quick Snippets                           |
|    ---------------------------------------- |
|    [Review checklist]                       |
|    [Issue triage rules]                     |
|    [Security guidelines]                    |
|    [Documentation style]                    |
|                                             |
+--------------------------------------------+
```

**Editor Mode**:
- Full markdown editor filling the panel body
- Monospace font, `font-size: 13px`, `line-height: 1.6`
- Syntax highlighting for markdown headings, lists, bold/italic
- Tab key inserts 2 spaces
- Character count shown below: current / max

**Preview Mode**:
- Rendered markdown preview using GitHub-flavored markdown
- Read-only

**Tabs**: "Edit" and "Preview" toggle tabs at top (Primer `UnderlineNav`)

**Quick Snippets**: Pre-built instruction templates the user can insert with one click. Each inserts a block of markdown at the cursor position.

### 4.7 Safe Outputs Node Properties

```
+--------------------------------------------+
| [Megaphone] Safe Outputs            [X]    |
+--------------------------------------------+
|                                             |
|  Output Actions [?]                         |
|  ----------------------------------------  |
|  What your agent can create or modify       |
|                                             |
|  Comments & Reviews                         |
|  ........................................   |
|  [x] Add Comment                            |
|  [x] Create PR Review Comment               |
|  [x] Submit PR Review                       |
|  [x] Reply to Review Comment                |
|  [ ] Resolve Review Thread                  |
|  [ ] Hide Comment                           |
|                                             |
|  Issues                                     |
|  ........................................   |
|  [x] Create Issue                           |
|  [ ] Close Issue                            |
|  [ ] Update Issue                           |
|  [ ] Link Sub-Issue                         |
|                                             |
|  Pull Requests                              |
|  ........................................   |
|  [ ] Create Pull Request                    |
|  [ ] Close Pull Request                     |
|  [ ] Update Pull Request                    |
|  [ ] Mark PR Ready for Review               |
|  [ ] Push to PR Branch                      |
|                                             |
|  Labels & Assignment                        |
|  ........................................   |
|  [x] Add Labels                             |
|  [ ] Remove Labels                          |
|  [ ] Add Reviewer                           |
|  [ ] Assign to User                         |
|  [ ] Unassign from User                     |
|  [ ] Assign to Agent (@copilot)             |
|  [ ] Assign Milestone                       |
|                                             |
|  Discussions                                |
|  ........................................   |
|  [ ] Create Discussion                      |
|  [ ] Close Discussion                       |
|  [ ] Update Discussion                      |
|                                             |
|  Projects                                   |
|  ........................................   |
|  [ ] Update Project                         |
|  [ ] Create Project                         |
|  [ ] Create Project Status Update           |
|                                             |
|  Code Scanning                              |
|  ........................................   |
|  [ ] Create Code Scanning Alert             |
|  [ ] Autofix Code Scanning Alert            |
|                                             |
|  Other                                      |
|  ........................................   |
|  [ ] Dispatch Workflow                      |
|  [ ] Upload Asset                           |
|  [ ] Update Release                         |
|                                             |
|  > Global Settings                          |
|    ---------------------------------------- |
|    Staged Mode [?]  [Toggle: OFF]           |
|    Preview without making real changes      |
|                                             |
|    Allowed Domains [?]                      |
|    [Tag input: github.com, ...]             |
|                                             |
|    Max Patch Size [?]                       |
|    [Number input: 100] KB                   |
|                                             |
|    Footer [?]  [Toggle: ON]                 |
|                                             |
|    Threat Detection [?]  [Toggle: OFF]      |
|                                             |
+--------------------------------------------+
```

**Output Checkboxes**:
- Grouped by category with section sub-headers
- Each checkbox: `font-size: 13px`
- Categories separated by 12px gap + dotted sub-header line
- Count shown in node: "N actions enabled"

**Complete output action list** (mapped from `safe-outputs` schema):
| Category | Action | Schema Key |
|----------|--------|------------|
| Comments & Reviews | Add Comment | `add-comment` |
| Comments & Reviews | Create PR Review Comment | `create-pull-request-review-comment` |
| Comments & Reviews | Submit PR Review | `submit-pull-request-review` |
| Comments & Reviews | Reply to Review Comment | `reply-to-pull-request-review-comment` |
| Comments & Reviews | Resolve Review Thread | `resolve-pull-request-review-thread` |
| Comments & Reviews | Hide Comment | `hide-comment` |
| Issues | Create Issue | `create-issue` |
| Issues | Close Issue | `close-issue` |
| Issues | Update Issue | `update-issue` |
| Issues | Link Sub-Issue | `link-sub-issue` |
| Pull Requests | Create Pull Request | `create-pull-request` |
| Pull Requests | Close Pull Request | `close-pull-request` |
| Pull Requests | Update Pull Request | `update-pull-request` |
| Pull Requests | Mark PR Ready | `mark-pull-request-as-ready-for-review` |
| Pull Requests | Push to PR Branch | `push-to-pull-request-branch` |
| Labels & Assignment | Add Labels | `add-labels` |
| Labels & Assignment | Remove Labels | `remove-labels` |
| Labels & Assignment | Add Reviewer | `add-reviewer` |
| Labels & Assignment | Assign to User | `assign-to-user` |
| Labels & Assignment | Unassign from User | `unassign-from-user` |
| Labels & Assignment | Assign to Agent | `assign-to-agent` |
| Labels & Assignment | Assign Milestone | `assign-milestone` |
| Discussions | Create Discussion | `create-discussion` |
| Discussions | Close Discussion | `close-discussion` |
| Discussions | Update Discussion | `update-discussion` |
| Projects | Update Project | `update-project` |
| Projects | Create Project | `create-project` |
| Projects | Project Status Update | `create-project-status-update` |
| Code Scanning | Create Alert | `create-code-scanning-alert` |
| Code Scanning | Autofix Alert | `autofix-code-scanning-alert` |
| Other | Dispatch Workflow | `dispatch-workflow` |
| Other | Upload Asset | `upload-asset` |
| Other | Update Release | `update-release` |
| Other | Create Agent Task | `create-agent-task` |
| Other | Create Agent Session | `create-agent-session` |

### 4.8 Network Node Properties

```
+--------------------------------------------+
| [Globe] Network                     [X]    |
+--------------------------------------------+
|                                             |
|  Network Access [?]                         |
|  ----------------------------------------  |
|  Control which domains the agent can reach  |
|                                             |
|  Quick Setup                                |
|  (*) Defaults (recommended)                 |
|  ( ) Custom                                 |
|  ( ) Unrestricted (no firewall)             |
|                                             |
|  Allowed Domains [?]                        |
|  (shown when Custom is selected)            |
|  ----------------------------------------  |
|  +-----------------------------------+      |
|  | github.com                    [x] |      |
|  | api.anthropic.com             [x] |      |
|  | pypi.org                      [x] |      |
|  | registry.npmjs.org            [x] |      |
|  +-----------------------------------+      |
|  [+ Add domain]                             |
|                                             |
|  Ecosystem Presets [?]                      |
|  [x] Python (pypi.org, etc.)                |
|  [x] Node (npmjs.org, etc.)                 |
|  [ ] Go (proxy.golang.org, etc.)            |
|  [ ] Rust (crates.io, etc.)                 |
|                                             |
|  Blocked Domains [?]                        |
|  ----------------------------------------  |
|  [Tag input: tracker.example.com, ...]      |
|                                             |
|  > Firewall Settings                        |
|    ---------------------------------------- |
|    Firewall [?]                             |
|    [Toggle: ON]  AWF (Agent Workflow FW)    |
|                                             |
|    Version [?]                              |
|    [Text input: 0.13.5]                     |
|                                             |
|    Log Level [?]                            |
|    [Dropdown: debug | info | warn | error]  |
|                                             |
|    SSL Bump [?]                             |
|    [Toggle: OFF]                            |
|                                             |
|    Allow URLs (requires SSL Bump) [?]       |
|    [Tag input: pattern, ...]                |
|                                             |
+--------------------------------------------+
```

**Domain List**:
- Each domain in its own row with a delete `[x]` button
- `+ Add domain` button below the list
- Input validates domain format (hostname with optional wildcard)
- Supports `*.example.com` wildcard patterns

**Ecosystem Presets**:
- Checkboxes that auto-add/remove known domains for each ecosystem
- Shows tooltip listing all domains in the preset on hover
- Maps to `network.allowed` array values like `"python"`, `"node"`

---

## 5. Color System & Theme

### 5.1 Node Accent Colors

| Node Type    | Light Mode    | Dark Mode     | CSS Variable             |
|--------------|---------------|---------------|--------------------------|
| Trigger      | `#2da44e`     | `#3fb950`     | `--node-trigger`         |
| Permissions  | `#d4a72c`     | `#d29922`     | `--node-permissions`     |
| Engine       | `#0969da`     | `#58a6ff`     | `--node-engine`          |
| Tools        | `#8250df`     | `#bc8cff`     | `--node-tools`           |
| Instructions | `#57606a`     | `#8b949e`     | `--node-instructions`    |
| Safe Outputs | `#1a7f37`     | `#56d364`     | `--node-safe-outputs`    |
| Network      | `#cf222e`     | `#f85149`     | `--node-network`         |

### 5.2 Status Colors

| Status   | Light Mode    | Dark Mode     | Usage                    |
|----------|---------------|---------------|--------------------------|
| Success  | `#2da44e`     | `#3fb950`     | Compile success, ready   |
| Warning  | `#d4a72c`     | `#d29922`     | Compile warnings         |
| Error    | `#cf222e`     | `#f85149`     | Compile errors           |
| Info     | `#0969da`     | `#58a6ff`     | Loading, compiling       |

### 5.3 Light Theme Palette

```
Background (canvas):    #ffffff
Background (subtle):    #f6f8fa
Background (muted):     #eaeef2
Foreground (default):   #1f2328
Foreground (muted):     #57606a
Foreground (subtle):    #6e7781
Border (default):       #d0d7de
Border (muted):         #d8dee4
Accent (fg):            #0969da
Accent (bg):            #ddf4ff
```

### 5.4 Dark Theme Palette

```
Background (canvas):    #0d1117
Background (subtle):    #161b22
Background (muted):     #21262d
Foreground (default):   #e6edf3
Foreground (muted):     #8b949e
Foreground (subtle):    #6e7681
Border (default):       #30363d
Border (muted):         #21262d
Accent (fg):            #58a6ff
Accent (bg):            #388bfd26
```

### 5.5 Canvas Grid

- **Light mode**: `radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)` every 20px
- **Dark mode**: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)` every 20px

### 5.6 Primer Design Tokens

The editor uses GitHub Primer design tokens wherever possible:

- Colors: `--bgColor-*`, `--fgColor-*`, `--borderColor-*`
- Typography: `--fontStack-monospace`, `--fontStack-system`
- Spacing: 4px base unit (4, 8, 12, 16, 20, 24, 32, 40, 48)
- Border radius: 6px (default), 8px (cards), 12px (nodes), 100px (pills)
- Shadows: Primer shadow utilities (`shadow-sm`, `shadow-md`)

---

## 6. Interactions & Animations

### 6.1 Node Interactions

**Hover**:
- Border color transitions to `--borderColor-emphasis` (darker)
- Subtle shadow elevation: `0 2px 8px rgba(0,0,0,0.12)`
- Transition: `border-color 150ms ease, box-shadow 150ms ease`

**Selected**:
- Border: 2px solid `--fgColor-accent` (blue)
- Shadow: `0 0 0 3px var(--bgColor-accent-muted)` (blue glow ring)
- Properties panel populates with node data

**Dragging**:
- Opacity: 0.85
- Shadow: `0 8px 24px rgba(0,0,0,0.15)` (elevated)
- Cursor: `grabbing`
- Other nodes dim slightly (opacity 0.7)

**Delete** (when node selected):
- Press `Delete` or `Backspace` key
- Node fades out with scale-down: `opacity 0 + scale(0.95)` over 150ms
- Connected edges animate retraction

### 6.2 Panel Transitions

**Sidebar collapse**:
- Width animates from 240px to 48px over 200ms, `ease-out`
- Node labels fade out during first 100ms
- Icons remain visible in collapsed state

**Properties panel collapse**:
- Width animates from 360px to 0px over 200ms, `ease-out`
- Content fades out during first 100ms
- A 32px wide "expand" tab slides in from the right edge

**YAML Preview drawer**:
- Slides up from bottom of canvas area
- Height: 40% of canvas height
- Transition: `transform 250ms cubic-bezier(0.4, 0, 0.2, 1)`
- Drag handle at top for resizing

### 6.3 Compilation Status Animation

**Compile button press**:
1. Button text changes to "Compiling..." with a spinner icon (replaces play icon)
2. Status badge pulses with blue dot animation
3. On success:
   - Status badge transitions to green "Ready"
   - Brief green flash on the YAML preview header (200ms)
   - If YAML preview is open, content updates with a subtle fade-in
4. On error:
   - Status badge transitions to red "Error"
   - Error banner slides down from below the header (200ms ease-out)
   - Affected node(s) get a red border pulse

### 6.4 Drag-and-Drop from Sidebar

1. **Grab**: User mousedowns on a sidebar node card
2. **Drag**: A ghost card follows the cursor at 0.7 opacity, with a subtle shadow
3. **Over canvas**: Canvas shows a translucent placement preview (dashed border outline where the node will land)
4. **Drop**: Node materializes with a scale-up animation (`scale(0.9)` to `scale(1)` over 150ms)
5. **Auto-connect**: If dropped near an existing node's output handle, an edge auto-connects with a drawing animation

### 6.5 Connection Drawing

1. **Start**: User drags from a node's output handle (small circle on the edge)
2. **Drawing**: A bezier curve follows the cursor from the source handle
3. **Snap**: When cursor approaches another node's input handle, the line snaps to it with a subtle glow on the target handle
4. **Complete**: Line solidifies and the handle highlights briefly
5. **Cancel**: Releasing over empty canvas causes the line to retract back to source (150ms)

### 6.6 Node Addition Animation

When a new node is added (via sidebar drag or template):
- Node appears with `opacity: 0, scale: 0.9` and animates to `opacity: 1, scale: 1` over 200ms
- If auto-connecting, the edge draws in after the node appears (100ms delay)

---

## 7. Component Specifications

### 7.1 Selectable Card

Used for: Event type selection, Engine selection

```
+---------------------------+
|  [Icon]  Label            |
|  Description text         |
+---------------------------+
```

- **Dimensions**: Flex, min-width 140px, height 56px
- **Padding**: 12px
- **Border**: 1px solid `--borderColor-default`
- **Border-radius**: 8px
- **Background**: `--bgColor-default`
- **Icon**: 24x24px, left-aligned, `color: --fgColor-muted`
- **Label**: `font-size: 13px`, `font-weight: 600`, `color: --fgColor-default`
- **Description**: `font-size: 11px`, `color: --fgColor-muted`
- **Hover**: `background: --bgColor-subtle`, `border-color: --borderColor-emphasis`
- **Selected**: `border: 2px solid --fgColor-accent`, `background: --bgColor-accent-muted`
- **Focus**: `box-shadow: 0 0 0 3px --bgColor-accent-muted`

### 7.2 Toggle Switch

Used for: Tool toggles, boolean settings

- **Track**: 34px x 20px, border-radius 10px
- **Knob**: 16px x 16px circle, white, `box-shadow: 0 1px 3px rgba(0,0,0,0.2)`
- **Off state**: Track background `--bgColor-neutral-muted`
- **On state**: Track background `--fgColor-accent`
- **Transition**: Knob `transform: translateX(14px)` over 180ms ease

### 7.3 Segmented Control

Used for: Permission levels (None/Read/Write)

- **Container**: Inline flex, border-radius 6px, border 1px solid `--borderColor-default`
- **Segment**: Padding `4px 12px`, `font-size: 12px`, `font-weight: 500`
- **Selected segment**: Background fill with accent color, white text
- **Segment variants**:
  - None: gray background when selected
  - Read: green tint background when selected
  - Write: amber tint background when selected
- **Transition**: Background color 150ms ease

### 7.4 Tag Input

Used for: Domains, labels, args, allowed functions

```
+------------------------------------------+
| [github.com x] [pypi.org x]  [type...]  |
+------------------------------------------+
```

- **Container**: Flex-wrap, min-height 36px, border 1px solid `--borderColor-default`, border-radius 6px, padding 4px
- **Tag**: Inline pill, `font-size: 12px`, background `--bgColor-muted`, border-radius 12px, padding `2px 8px`
- **Tag remove**: Small `x` button (14px), appears on hover
- **Input**: Borderless, `font-size: 13px`, grows to fill remaining width
- **Enter or comma**: Creates a new tag from current input
- **Autocomplete**: Dropdown appears below with matching suggestions when applicable

### 7.5 Number Input with Slider

Used for: Max turns, timeouts

```
[----o------------------] [10]
```

- **Slider track**: Full width minus 60px, height 4px, border-radius 2px, `--bgColor-muted`
- **Slider fill**: Height 4px, `--fgColor-accent`
- **Thumb**: 16px circle, white, `box-shadow: 0 1px 3px rgba(0,0,0,0.2)`, accent border
- **Number input**: 56px wide, border 1px solid `--borderColor-default`, border-radius 6px, `font-size: 13px`, text-align center

### 7.6 Key-Value Editor

Used for: Environment variables, secrets

```
+------------------------------------------+
| Key              | Value            [x]  |
+------------------------------------------+
| API_KEY          | ${{ secrets.KEY }} [x] |
| NODE_ENV         | production         [x] |
+------------------------------------------+
| [+ Add variable]                         |
+------------------------------------------+
```

- **Row height**: 36px
- **Key input**: 40% width, `font-family: monospace`, `font-size: 13px`
- **Value input**: 50% width, same styling
- **Delete button**: 10% width, `btn-octicon` with trash icon
- **Add button**: Full width, dashed border, `color: --fgColor-muted`

### 7.7 Tooltip

Used for: `[?]` help icons on every field

- **Trigger**: Small `?` circle icon (16px), `color: --fgColor-muted`, `cursor: help`
- **Tooltip body**: Max-width 280px, `font-size: 12px`, `line-height: 1.5`
- **Background**: `--bgColor-emphasis` (dark in light mode, light in dark mode)
- **Text color**: `--fgColor-onEmphasis`
- **Border-radius**: 6px
- **Padding**: 8px 12px
- **Arrow**: 6px CSS triangle pointing toward the trigger
- **Show delay**: 200ms hover
- **Hide delay**: 100ms mouse leave

### 7.8 Dropdown Select

Used for: Model selection, log level, mode

- **Trigger**: Button-style, `font-size: 13px`, border 1px solid `--borderColor-default`, border-radius 6px, padding `6px 12px`
- **Chevron**: Small down arrow on right
- **Dropdown**: Max-height 200px, overflow-y auto, `box-shadow: 0 4px 12px rgba(0,0,0,0.15)`, border-radius 8px
- **Item**: Padding `8px 12px`, `font-size: 13px`
- **Item hover**: `background: --bgColor-accent-muted`
- **Selected item**: Checkmark icon on left

### 7.9 YAML Preview Panel

```
+------------------------------------------------------------------+
| ===== drag handle =====                              [Copy] [X]  |
+------------------------------------------------------------------+
|  1 | # Auto-generated by gh-aw visual editor                     |
|  2 | name: my-workflow                                           |
|  3 | on:                                                          |
|  4 |   issue_comment:                                             |
|  5 |     types: [created]                                         |
|  6 |                                                              |
+------------------------------------------------------------------+
```

- **Height**: 40% of canvas, resizable via drag handle
- **Background**: `--bgColor-subtle`
- **Font**: Monospace, `font-size: 13px`, `line-height: 1.6`
- **Line numbers**: 48px gutter, right-aligned, `color: --fgColor-muted`
- **Syntax highlighting**: YAML keywords in accent color, strings in green, comments in muted
- **Read-only**: No editing allowed (output only)
- **Copy button**: Top-right corner, copies full YAML to clipboard

---

## 8. Onboarding Design

### 8.1 Welcome Modal

Shown on first visit (tracked in localStorage).

```
+----------------------------------------------------------+
|                                                          |
|           [Illustration: connected workflow nodes]        |
|                                                          |
|     Welcome to the Visual Workflow Editor                |
|                                                          |
|     Build AI-powered GitHub workflows visually.          |
|     No code required.                                    |
|                                                          |
|     Start from a template:                               |
|                                                          |
|     +-------------------+  +-------------------+         |
|     | [Chat] PR Review  |  | [Bug] Issue Triage|         |
|     | AI reviews pull   |  | Auto-label and    |         |
|     | requests for...   |  | route issues...   |         |
|     +-------------------+  +-------------------+         |
|     +-------------------+  +-------------------+         |
|     | [Shield] Security |  | [Zap] Custom Bot  |         |
|     | Scan code for     |  | Start with a      |         |
|     | vulnerabilities...|  | blank canvas...   |         |
|     +-------------------+  +-------------------+         |
|                                                          |
|     [Start from scratch]           [Don't show again]    |
|                                                          |
+----------------------------------------------------------+
```

- **Overlay**: Semi-transparent backdrop `rgba(0,0,0,0.5)`
- **Modal**: 560px wide, border-radius 12px, `--bgColor-default`
- **Illustration**: Simple SVG showing connected nodes (120px tall)
- **Title**: `font-size: 24px`, `font-weight: 600`
- **Subtitle**: `font-size: 14px`, `color: --fgColor-muted`
- **Template cards**: 2x2 grid, same selectable card pattern (240px wide, 72px tall)
- **"Start from scratch"**: Primer `btn btn-primary`
- **"Don't show again"**: Text link, `font-size: 12px`, `color: --fgColor-muted`

### 8.2 Template Definitions

| Template | Trigger | Engine | Tools | Safe Outputs | Description |
|----------|---------|--------|-------|--------------|-------------|
| PR Review | `pull_request: opened, synchronize` | copilot | github, bash | add-comment, submit-review | Reviews PRs for quality |
| Issue Triage | `issues: opened, labeled` | copilot | github | add-labels, add-comment, assign-to-user | Auto-labels and routes issues |
| Security Scan | `push` + `schedule: daily` | claude | github, bash | create-issue, add-labels, create-code-scanning-alert | Scans for vulnerabilities |
| Custom Bot | `issue_comment` (slash_command) | copilot | github, bash | add-comment | Blank slash-command bot |

Each template generates a complete node graph pre-populated with:
- Correct trigger configuration
- Appropriate engine selection
- Recommended tools enabled
- Safe outputs selected
- Network set to "defaults"
- Permissions auto-detected from tools/outputs
- Starter instructions in the Instructions node

### 8.3 Guided Tour

A 5-step tooltip tour that highlights key areas. Uses a spotlight effect (dims everything except the highlighted area).

**Step 1: Sidebar**
```
+-------------------+
| Drag nodes from   |
| here onto the     |
| canvas to build   |
| your workflow.    |
|                   |
| [1/5]   [Next >]  |
+-------------------+
       \
        v (points to sidebar)
```

**Step 2: Canvas**
```
+-------------------+
| This is your      |
| workflow canvas.  |
| Nodes represent   |
| each part of      |
| your workflow.    |
|                   |
| [2/5]   [Next >]  |
+-------------------+
       \
        v (points to canvas center)
```

**Step 3: Node connections**
```
+-------------------+
| Drag from one     |
| node's handle to  |
| another to        |
| connect them.     |
|                   |
| [3/5]   [Next >]  |
+-------------------+
       \
        v (points to an edge)
```

**Step 4: Properties panel**
```
+-------------------+
| Click any node    |
| to configure it   |
| here. Each node   |
| type has its own  |
| settings.         |
|                   |
| [4/5]   [Next >]  |
+-------------------+
       \
        v (points to properties panel)
```

**Step 5: Compile**
```
+-------------------+
| When you're done, |
| hit Compile to    |
| generate the      |
| GitHub Actions    |
| YAML file.        |
|                   |
| [5/5]   [Done!]   |
+-------------------+
       \
        v (points to compile button)
```

**Tour tooltip styling**:
- Background: `--bgColor-emphasis` (dark)
- Text: `--fgColor-onEmphasis` (white)
- Border-radius: 8px
- Padding: 16px
- Width: 240px
- Arrow: CSS triangle pointing to highlighted element
- Progress: "N/5" counter
- "Next" button: Primer `btn btn-sm btn-primary`
- "Skip tour" link: `font-size: 12px`, underlined, `color: --fgColor-onEmphasis`
- Spotlight: Highlighted element gets `z-index: 1000` and the rest of the page is dimmed with a dark overlay

### 8.4 Empty State Designs

**Empty Canvas** (no nodes placed):
```
+--------------------------------------------------+
|                                                    |
|          [Illustration: dashed rectangle           |
|           with arrow from sidebar]                 |
|                                                    |
|     Drag a node from the sidebar                   |
|     to start building your workflow                |
|                                                    |
|     or                                             |
|                                                    |
|     [Choose a template]                            |
|                                                    |
+--------------------------------------------------+
```

**Empty Properties Panel** (no node selected):
```
+--------------------------------------------+
|                                             |
|     [Illustration: cursor clicking node]    |
|                                             |
|     Select a node on the canvas             |
|     to edit its properties                  |
|                                             |
+--------------------------------------------+
```

**Empty state styling**:
- Illustration: Simple SVG line art, 80px tall, `color: --fgColor-muted` at 40% opacity
- Text: `font-size: 14px`, `color: --fgColor-muted`, text-align center
- CTA button: Primer `btn btn-sm btn-outline`

---

## Appendix A: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Enter` | Compile workflow |
| `Ctrl/Cmd + S` | Save / Download .md |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Delete` / `Backspace` | Delete selected node |
| `Ctrl/Cmd + A` | Select all nodes |
| `Ctrl/Cmd + D` | Duplicate selected node |
| `Space + Drag` | Pan canvas |
| `Ctrl/Cmd + +/-` | Zoom in/out |
| `Ctrl/Cmd + 0` | Reset zoom to 100% |
| `Ctrl/Cmd + 1` | Fit all nodes to view |
| `Escape` | Deselect all / Close panel |
| `?` | Open keyboard shortcut help |

## Appendix B: Responsive Behavior

**Breakpoints**:
- Desktop: >= 1024px - full 3-panel layout
- Tablet: 768px - 1023px - sidebar collapses to icon rail, properties panel becomes overlay
- Mobile: < 768px - single panel view with bottom sheet navigation

**Tablet mode**:
- Sidebar: 48px icon rail (always collapsed)
- Canvas: fills remaining space
- Properties: Slides in as overlay from right (320px), with backdrop dim

**Mobile mode**:
- Canvas takes full screen
- Bottom tab bar replaces sidebar: [Palette] [Canvas] [Properties] [YAML]
- Each tab shows its panel as full-screen view
- Nodes are touch-draggable with long-press to initiate

## Appendix C: Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Header title | System | 14px | 600 | `--fgColor-default` |
| Node title | System | 13px | 600 | `--fgColor-default` |
| Node subtitle | System | 11px | 400 | `--fgColor-muted` |
| Node content | System | 12px | 400 | `--fgColor-default` |
| Panel section header | System | 12px | 600 | `--fgColor-muted` |
| Panel field label | System | 13px | 500 | `--fgColor-default` |
| Panel help text | System | 12px | 400 | `--fgColor-muted` |
| Code / YAML | Monospace | 13px | 400 | `--fgColor-default` |
| Badge / Label | System | 12px | 500 | varies |
| Tooltip | System | 12px | 400 | `--fgColor-onEmphasis` |

Font stacks:
- **System**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif` (Primer default)
- **Monospace**: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace` (Primer monospace)
