# Spec: Canvas-Native Instructions Editor

## Problem Statement

Today, writing agent instructions in the visual workflow editor requires a disjointed two-step interaction:

1. Click the "Instructions" node on the canvas
2. A right-side panel opens with a plain textarea

This creates several UX problems:
- **Context switching**: The user's eyes must jump from the canvas to a side panel, breaking spatial flow
- **The instructions feel secondary**: Despite being the most important part of any agent workflow (they define _what the agent does_), instructions are given the same generic panel treatment as toggle-heavy config nodes like permissions or network
- **The textarea is generic and uninspiring**: A plain monospace textarea with no formatting affordances, no structure helpers, and no visual hierarchy
- **No inline preview**: The canvas node shows only 3 truncated lines of preview text, giving no sense of the instruction's richness

Instructions are the soul of an agentic workflow. They deserve a first-class, delightful authoring experience directly on the canvas.

## Vision

When a user clicks the Instructions node (or double-clicks to enter edit mode), the node expands into a beautiful, full-featured inline editor directly on the canvas. The editor feels like writing in a modern note-taking app - clean, focused, with just enough formatting support to structure agent instructions clearly. The experience is so pleasant that users _want_ to spend time crafting their instructions.

---

## User Stories

### P1 - Core Inline Editing

#### US-1: Expand instructions node into inline editor
**As a** workflow author
**I want to** double-click the Instructions node and have it expand into an inline editor on the canvas
**So that** I can write instructions without leaving my visual context

**Acceptance Scenarios:**

```gherkin
Scenario: Double-click to expand
  Given I am viewing the workflow canvas with an Instructions node
  When I double-click the Instructions node
  Then the node smoothly expands into a larger inline editor card
  And the editor textarea is automatically focused
  And the canvas pans/zooms to keep the editor comfortably centered

Scenario: Single-click preserves current behavior
  Given I am viewing the workflow canvas
  When I single-click the Instructions node
  Then the right panel opens as before (backward compatible)
  And the node does NOT expand inline

Scenario: Click outside to collapse
  Given the inline instructions editor is expanded on the canvas
  When I click on the canvas background or another node
  Then the editor smoothly collapses back to the compact node preview
  And my text changes are preserved

Scenario: Escape to collapse
  Given the inline instructions editor is expanded and focused
  When I press Escape
  Then the editor collapses back to the compact node
  And focus returns to the canvas
```

#### US-2: Rich inline editing experience
**As a** workflow author
**I want** the inline editor to feel like a modern writing surface
**So that** writing instructions is pleasant and efficient

**Acceptance Scenarios:**

```gherkin
Scenario: Auto-growing editor
  Given the inline editor is expanded
  When I type multiple lines of instructions
  Then the editor height grows smoothly to fit content
  And the editor has a reasonable max-height with scrolling

Scenario: Placeholder guidance
  Given the inline editor is expanded and empty
  Then I see helpful placeholder text guiding me on what to write
  And the placeholder disappears when I start typing

Scenario: Character count
  Given I am typing in the inline editor
  Then I see a subtle character count in the bottom-right corner
  And it updates in real-time as I type

Scenario: Live compilation feedback
  Given I am typing in the inline editor
  When I pause typing for 500ms
  Then the workflow auto-compiles in the background
  And any compilation errors related to instructions are shown inline
```

#### US-3: Quick-insert snippets toolbar
**As a** workflow author
**I want** quick-access buttons to insert common instruction patterns
**So that** I can build instructions faster without typing everything from scratch

**Acceptance Scenarios:**

```gherkin
Scenario: Snippets toolbar visible
  Given the inline editor is expanded
  Then I see a toolbar below the text area with snippet buttons
  And the toolbar has common patterns like "Be concise", "Review code", "Create issue"

Scenario: Insert snippet
  Given the inline editor is expanded with some text
  When I click a snippet button
  Then the snippet text is appended to my instructions
  And the cursor moves to the end of the inserted text

Scenario: Toolbar doesn't obstruct
  Given the inline editor is expanded
  Then the snippets toolbar does not overlap the text area
  And the toolbar scrolls horizontally if there are many snippets
```

### P2 - Enhanced Editing Features

#### US-4: Markdown formatting shortcuts
**As a** workflow author
**I want** basic markdown formatting support in the inline editor
**So that** I can structure my instructions with headings, lists, and emphasis

**Acceptance Scenarios:**

```gherkin
Scenario: Formatting toolbar
  Given the inline editor is expanded
  Then I see a subtle formatting toolbar above the text area
  And it includes buttons for: Bold, Italic, Heading, Bulleted list, Numbered list

Scenario: Apply bold formatting
  Given I have selected text in the inline editor
  When I click the Bold button or press Cmd/Ctrl+B
  Then the selected text is wrapped with ** markers
  And the selection is preserved

Scenario: Insert heading
  Given my cursor is at the beginning of a line
  When I click the Heading button
  Then "## " is inserted at the start of the line
```

#### US-5: Improved node preview when collapsed
**As a** workflow author
**I want** the collapsed Instructions node to show a richer preview of my instructions
**So that** I can see at a glance what the agent will do

**Acceptance Scenarios:**

```gherkin
Scenario: Multi-line preview
  Given I have written instructions with multiple sections
  When the Instructions node is in collapsed state
  Then I see up to 4 lines of preview text
  And the text preserves visual structure (headings appear bolder)
  And a "..." indicator shows if there's more content

Scenario: Empty state with better CTA
  Given I have not written any instructions
  When I view the Instructions node
  Then I see an inviting call-to-action: "Double-click to write instructions"
  And the CTA has a subtle pen/edit icon
```

### P3 - Polish & Delight

#### US-6: Smooth expand/collapse animation
**As a** workflow author
**I want** the transition between collapsed node and expanded editor to be buttery smooth
**So that** the experience feels polished and professional

**Acceptance Scenarios:**

```gherkin
Scenario: Expand animation
  Given the Instructions node is in collapsed state
  When I double-click to expand
  Then the node expands with a smooth ease-out animation (~250ms)
  And the content fades in slightly after the container expands
  And neighboring nodes gently shift to make room

Scenario: Collapse animation
  Given the inline editor is expanded
  When I click outside to collapse
  Then the editor shrinks with a smooth ease-in animation (~200ms)
  And the preview text fades in as the editor shrinks
```

---

## Success Criteria

1. **Adoption**: >80% of instruction editing happens via the inline editor (not the side panel) within a session
2. **Speed**: Time from double-click to first keystroke < 300ms
3. **Stability**: Zero regressions in existing e2e tests
4. **Accessibility**: Inline editor is fully keyboard-navigable (Tab, Escape, shortcuts)
5. **Responsiveness**: Works correctly on viewports >= 768px wide (on mobile, fall back to panel)

## Out of Scope

- AI-assisted instruction writing (autocomplete, suggestions) - future enhancement
- Collaborative editing - single-user tool
- Full rich-text/WYSIWYG editing - we use plain text with optional markdown shortcuts
- Drag-to-reorder instruction blocks - plain text is sufficient
