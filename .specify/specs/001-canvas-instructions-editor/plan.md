# Implementation Plan: Canvas-Native Instructions Editor

## Architecture Overview

The inline instructions editor is a new React Flow node type variant that replaces the compact `InstructionsNode` when the user double-clicks it. It renders directly on the canvas as a larger, interactive node with a real textarea.

### Key Technical Decisions

1. **Node expansion via React Flow node resizing**: When expanded, the InstructionsNode renders a wider/taller variant. React Flow handles re-layout via Dagre.
2. **State in Zustand**: Add `instructionsExpanded: boolean` to `workflowStore` to track inline editor state.
3. **CSS transitions for animation**: Use CSS transitions on width/height/opacity for smooth expand/collapse.
4. **Textarea with `nodrag` class**: React Flow's `nodrag` class prevents node dragging when interacting with the textarea, allowing normal text selection and input.
5. **Formatting toolbar**: Simple button row that wraps selected text with markdown markers. No rich-text rendering.

## File Changes

### New Files
- `src/components/Nodes/InstructionsNodeExpanded.tsx` - The expanded inline editor component
- `src/styles/instructions-editor.css` - Styles for the expanded editor
- `e2e/inline-instructions.spec.ts` - Playwright tests for the new feature

### Modified Files
- `src/components/Nodes/InstructionsNode.tsx` - Add double-click handler, conditional rendering
- `src/stores/workflowStore.ts` - Add `instructionsExpanded` state + actions
- `src/components/Canvas/WorkflowGraph.tsx` - Adjust node dimensions when expanded
- `src/styles/nodes.css` - Add expanded node styles
- `src/components/Panels/InstructionsPanel.tsx` - No changes needed (kept for backward compat)

## Component Design

### InstructionsNode (modified)
```
- Handles double-click → sets instructionsExpanded = true
- When expanded: renders InstructionsNodeExpanded
- When collapsed: renders current preview (with improved preview per US-5)
```

### InstructionsNodeExpanded (new)
```
┌──────────────────────────────────────────────┐
│ 📝 Instructions                         ─ ✕  │
│──────────────────────────────────────────────│
│ [B] [I] [H] [•] [1.]           formatting   │
│──────────────────────────────────────────────│
│                                              │
│  Tell the AI what to do...                   │
│                                              │
│  (auto-growing textarea, min 6 lines)        │
│                                              │
│──────────────────────────────────────────────│
│ [+ Be concise] [+ Review code] [+ ...]  42c │
└──────────────────────────────────────────────┘
  Width: 480px (vs 260px collapsed)
  Max height: 400px with scroll
```

### Data Flow
```
Double-click InstructionsNode
  → workflowStore.setInstructionsExpanded(true)
  → InstructionsNode re-renders with expanded=true
  → Renders InstructionsNodeExpanded inside BaseNode (wider)
  → WorkflowGraph detects expanded state, uses larger node dimensions for Dagre
  → Canvas auto-fits to accommodate larger node

Type in textarea
  → workflowStore.setInstructions(text)
  → Auto-compile fires (existing debounce)
  → Collapsed preview updates when collapsed

Click outside / Escape
  → workflowStore.setInstructionsExpanded(false)
  → Node collapses with CSS transition
  → Dagre re-layouts with original dimensions
```

## Responsive Behavior

- **Desktop (>= 1024px)**: Full inline editor on canvas
- **Tablet (768-1023px)**: Inline editor but slightly narrower (420px)
- **Mobile (< 768px)**: Fall back to right panel (no inline editor)
