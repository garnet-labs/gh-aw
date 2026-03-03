# Constitution

## Principles

1. **Visual-First**: The canvas is the primary workspace. Key interactions should happen directly on the canvas, not in side panels.
2. **Delight**: Every interaction should feel polished, responsive, and satisfying. Animations, transitions, and micro-interactions matter.
3. **Simplicity**: Fewer clicks, fewer context switches. The fastest path to a configured workflow wins.
4. **Consistency**: Follow existing Primer design tokens, dark mode support, and component patterns.
5. **Accessibility**: All interactions must be keyboard-navigable and screen-reader friendly.
6. **Performance**: No perceptible lag. Lazy-load where possible but never at the cost of interaction speed.

## Constraints

- Must work within the existing React Flow + Zustand + Vite architecture
- Must maintain backward compatibility with existing localStorage state
- Must support both light and dark modes via CSS custom properties
- Must not break existing Playwright e2e tests
- Must work on mobile viewports (responsive)
