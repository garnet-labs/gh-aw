import { test, expect } from '@playwright/test';
import { dismissWelcomeModal, loadTemplate, clickNode, waitForCompilation } from './helpers';

/**
 * Double-click a node by dispatching a native dblclick event.
 *
 * Playwright's locator.dblclick() fires two sequential clicks. The first click
 * triggers ReactFlow's onNodeClick → selectNode → React re-render, which
 * replaces the DOM node before the second click lands. The browser then never
 * fires a native dblclick. Dispatching the event directly avoids this problem.
 */
async function doubleClickNode(page: import('@playwright/test').Page, tourTarget: string) {
  await page.locator(`[data-tour-target="${tourTarget}"]`).dispatchEvent('dblclick');
}

test.describe('Inline Instructions Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
    await loadTemplate(page, 'Issue Triage');
    await waitForCompilation(page);
  });

  test('double-click instructions node expands inline editor', async ({ page }) => {
    await doubleClickNode(page, 'instructions');

    // Expanded editor should be visible
    const editor = page.locator('.instructions-editor');
    await expect(editor).toBeVisible();

    // Textarea should be focused
    const textarea = page.locator('.instructions-editor__textarea');
    await expect(textarea).toBeVisible();
    await expect(textarea).toBeFocused();

    // Node should have the expanded class
    const instructionsNode = page.locator('[data-tour-target="instructions"]');
    await expect(instructionsNode).toHaveClass(/instructions-expanded/);
  });

  test('typing in inline editor updates instructions', async ({ page }) => {
    await doubleClickNode(page, 'instructions');

    const textarea = page.locator('.instructions-editor__textarea');
    await expect(textarea).toBeVisible();

    // Clear existing content and type new text
    await textarea.fill('Test instruction text');

    // Click canvas to collapse
    await page.locator('.react-flow__pane').click({ position: { x: 50, y: 50 } });

    // Editor should collapse
    await expect(page.locator('.instructions-editor')).toBeHidden();

    // Node preview should show the typed text
    const instructionsNode = page.locator('[data-tour-target="instructions"]');
    await expect(instructionsNode).toContainText('Test instruction text');
  });

  test('click outside collapses inline editor', async ({ page }) => {
    await doubleClickNode(page, 'instructions');

    // Editor should be visible
    await expect(page.locator('.instructions-editor')).toBeVisible();

    // Click on canvas background
    await page.locator('.react-flow__pane').click({ position: { x: 50, y: 50 } });

    // Expanded editor should be hidden
    await expect(page.locator('.instructions-editor')).toBeHidden();

    // Node should no longer have expanded class
    const instructionsNode = page.locator('[data-tour-target="instructions"]');
    await expect(instructionsNode).not.toHaveClass(/instructions-expanded/);
  });

  test('Escape key collapses inline editor', async ({ page }) => {
    await doubleClickNode(page, 'instructions');

    // Editor should be visible
    await expect(page.locator('.instructions-editor')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Expanded editor should be hidden
    await expect(page.locator('.instructions-editor')).toBeHidden();

    // Node should no longer have expanded class
    const instructionsNode = page.locator('[data-tour-target="instructions"]');
    await expect(instructionsNode).not.toHaveClass(/instructions-expanded/);
  });

  test('snippet buttons insert text', async ({ page }) => {
    await doubleClickNode(page, 'instructions');

    const textarea = page.locator('.instructions-editor__textarea');
    await expect(textarea).toBeVisible();

    // Clear any existing content
    await textarea.fill('');

    // Click "Be concise" snippet button
    await page.locator('.instructions-editor__snippet-btn', { hasText: 'Be concise' }).click();

    // Textarea should contain the snippet text
    const expectedText = 'Keep your responses brief and to the point.';
    await expect(textarea).toHaveValue(expectedText);

    // Character count should reflect the text length
    const counter = page.locator('.instructions-editor__counter');
    await expect(counter).toContainText(`${expectedText.length} characters`);
  });

  test('single-click still opens right panel without expanding editor', async ({ page }) => {
    // Single-click the instructions node (force: true to handle viewport issues)
    await page.locator('[data-tour-target="instructions"]').click({ force: true });

    // Properties panel should open with "Instructions" title
    const panelTitle = page.locator('.panel__title');
    await expect(panelTitle).toBeVisible();
    await expect(panelTitle).toContainText('Instructions');

    // Inline editor should NOT expand
    await expect(page.locator('.instructions-editor')).toBeHidden();

    // Node should NOT have expanded class
    const instructionsNode = page.locator('[data-tour-target="instructions"]');
    await expect(instructionsNode).not.toHaveClass(/instructions-expanded/);
  });
});
