# Tasks: Canvas-Native Instructions Editor

## Phase 1: Foundation

- [ ] [T1] [P1] [US-1] Add `instructionsExpanded` boolean + `setInstructionsExpanded` action to workflowStore.ts
- [ ] [T2] [P1] [US-1] Create `InstructionsNodeExpanded.tsx` component with textarea, auto-focus, `nodrag`/`nowheel` classes
- [ ] [T3] [P1] [US-1] Create `instructions-editor.css` with expanded node styles, dark mode support, CSS transitions
- [ ] [T4] [P1] [US-1] Modify `InstructionsNode.tsx` to handle double-click → expand, render expanded variant conditionally

## Phase 2: Canvas Integration

- [ ] [T5] [P1] [US-1] Update `WorkflowGraph.tsx` to use larger node dimensions (480x400) when instructions is expanded
- [ ] [T6] [P1] [US-1] Add click-outside and Escape handlers to collapse the expanded editor
- [ ] [T7] [P1] [US-2] Implement auto-growing textarea height with max-height + scroll
- [ ] [T8] [P1] [US-3] Add snippet buttons toolbar below textarea in expanded editor

## Phase 3: Enhanced Features

- [ ] [T9] [P2] [US-4] Add formatting toolbar (Bold, Italic, Heading, List) with keyboard shortcuts
- [ ] [T10] [P2] [US-5] Improve collapsed node preview: 4 lines, better CTA with edit icon
- [ ] [T11] [P3] [US-6] Polish expand/collapse animations (ease-out 250ms, content fade-in stagger)

## Phase 4: Testing

- [ ] [T12] [P1] Create Playwright e2e test: double-click expands, typing works, click-outside collapses
- [ ] [T13] [P1] Create Playwright e2e test: snippets insert text, character count updates
- [ ] [T14] [P2] Create Playwright e2e test: formatting toolbar applies markdown markers
- [ ] [T15] [P1] Verify existing e2e tests still pass (no regressions)
