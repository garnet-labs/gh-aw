import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:5175/gh-aw/editor/';
const TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'Mossaka/gh-aw-deploy';
const BRANCH = `aw/e2e-test-${Date.now()}`;

async function main() {
  console.log('--- E2E Deploy Test ---');
  console.log(`Branch: ${BRANCH}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`[BROWSER ERROR] ${msg.text()}`);
    }
  });

  // Step 1: Navigate to the editor — clear localStorage first so welcome modal shows
  console.log('\n1. Loading editor...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  // Mark onboarding as seen to avoid it, then set up a template programmatically
  await page.evaluate(() => {
    // Mark onboarding as seen so the modal closes
    const uiState = JSON.parse(localStorage.getItem('workflow-editor-ui') || '{}');
    uiState.state = { ...uiState.state, hasSeenOnboarding: true };
    localStorage.setItem('workflow-editor-ui', JSON.stringify(uiState));
  });
  // Reload with onboarding dismissed
  await page.reload({ waitUntil: 'networkidle' });
  console.log('   Editor loaded (onboarding dismissed).');

  // Step 2: Load a template by clicking "Browse templates" button in sidebar
  console.log('\n2. Loading a template...');

  // Find and click the Templates tab in the sidebar
  const templatesTabBtn = page.locator('button:has-text("Templates")').first();
  if (await templatesTabBtn.isVisible({ timeout: 3000 })) {
    await templatesTabBtn.click();
    console.log('   Clicked Templates tab.');
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: '/tmp/deploy-02-templates-tab.png' });

  // Look for template items and click the first one (Issue Triage)
  // Templates in the sidebar might be buttons with the template name
  const issueTriageBtn = page.locator('button:has-text("Issue Triage")').first();
  if (await issueTriageBtn.isVisible({ timeout: 3000 })) {
    await issueTriageBtn.click();
    console.log('   Clicked Issue Triage template.');
  } else {
    // Load template programmatically
    console.log('   Loading template programmatically...');
    await page.evaluate(() => {
      // Access the workflow store and load Issue Triage template
      const store = (window as unknown as { __ZUSTAND_STORES__?: Record<string, unknown> }).__ZUSTAND_STORES__;
      if (store) console.log('Store found');
    });

    // Set the state directly via localStorage and reload
    await page.evaluate(() => {
      const templateState = {
        state: {
          name: 'issue-triage',
          description: 'Analyze new issues, apply labels, detect spam, find duplicates, and post triage notes',
          trigger: {
            event: 'issues',
            activityTypes: ['opened', 'reopened'],
            branches: [],
            paths: [],
            schedule: '',
            skipRoles: [],
            skipBots: false,
            roles: [],
            bots: [],
            reaction: 'eyes',
            statusComment: false,
            manualApproval: '',
            slashCommandName: '',
          },
          permissions: {
            contents: 'read',
            issues: 'read',
            'pull-requests': 'read',
            actions: 'read',
            checks: 'read',
            'security-events': 'read',
            statuses: 'read',
            metadata: 'read',
          },
          engine: { type: 'claude', model: '', maxTurns: '', version: '', config: {} },
          tools: ['web-fetch', 'github'],
          toolConfigs: {},
          instructions: 'You are a triage assistant for GitHub issues. When a new issue is opened or reopened:\n1. Fetch the issue content. If it is spam or bot-generated, add a one-sentence comment and exit.\n2. Gather context: fetch available labels, find similar open issues, and read any comments.\n3. Analyze the issue type (bug, feature, question), severity, affected components, and user impact.\n4. Apply up to 5 labels that accurately reflect the issue. Only use labels from the repository\'s label list.\n5. Post a triage comment.',
          safeOutputs: {
            'add-labels': { enabled: true, config: { max: 5 } },
            'add-comment': { enabled: true, config: {} },
          },
          network: { allowed: ['defaults'], blocked: [] },
          timeoutMinutes: 15,
          imports: [],
          environment: {},
          cache: false,
          strict: false,
          concurrency: { group: '', cancelInProgress: false },
          rateLimit: { max: '', window: '' },
          platform: '',
        },
      };
      localStorage.setItem('workflow-editor-state', JSON.stringify(templateState));
    });
    await page.reload({ waitUntil: 'networkidle' });
    console.log('   Template loaded via localStorage.');
  }

  // Step 3: Wait for WASM compilation
  console.log('\n3. Waiting for WASM compilation...');
  for (let i = 0; i < 30; i++) {
    const statusEl = page.locator('[aria-label^="Compilation status"]');
    if (await statusEl.isVisible({ timeout: 500 })) {
      const text = await statusEl.textContent();
      if (text?.includes('Ready') || text?.includes('warning')) {
        console.log(`   Status: ${text}`);
        break;
      }
      if (i % 5 === 0) console.log(`   Waiting... (${text})`);
    }
    await page.waitForTimeout(500);
  }

  // Verify we have compiled content
  const hasContent = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('workflow-editor-state') || '{}');
    return {
      hasName: !!state?.state?.name,
      name: state?.state?.name,
    };
  });
  console.log(`   Workflow name: ${hasContent.name}`);

  await page.screenshot({ path: '/tmp/deploy-03-ready.png' });

  // Step 4: Open Export menu
  console.log('\n4. Opening Export menu...');
  const exportBtn = page.locator('[aria-label="Export workflow"]');
  await exportBtn.waitFor({ state: 'visible', timeout: 5000 });
  await exportBtn.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/deploy-04-export-menu.png' });

  // Step 5: Click Deploy to GitHub
  console.log('\n5. Clicking Deploy to GitHub...');
  const deployBtn = page.locator('[data-testid="deploy-to-github-btn"]');
  await deployBtn.waitFor({ state: 'visible', timeout: 5000 });
  await deployBtn.click();
  await page.waitForTimeout(500);

  // Step 6: Deploy dialog open
  console.log('\n6. Deploy dialog open...');
  const dialog = page.locator('[data-testid="deploy-dialog"]');
  await dialog.waitFor({ timeout: 5000 });
  await page.screenshot({ path: '/tmp/deploy-05-dialog.png' });

  // Step 7: Enter token
  console.log('\n7. Entering token...');
  const tokenInput = page.locator('[data-testid="token-input"]');
  await tokenInput.waitFor({ timeout: 5000 });
  await tokenInput.fill(TOKEN);
  const saveContinueBtn = page.locator('[data-testid="save-continue-btn"]');
  await saveContinueBtn.click();
  console.log('   Validating token...');

  // Wait for repo step
  const repoInput = page.locator('[data-testid="repo-input"]');
  await repoInput.waitFor({ timeout: 15000 });
  console.log('   Token valid. On repo step.');
  await page.screenshot({ path: '/tmp/deploy-06-repo-step.png' });

  // Step 8: Fill repo and branch
  console.log('\n8. Filling repo and branch...');
  await repoInput.fill(REPO);
  const branchInput = page.locator('[data-testid="branch-input"]');
  await branchInput.clear();
  await branchInput.fill(BRANCH);
  await page.screenshot({ path: '/tmp/deploy-07-filled.png' });

  // Step 9: Deploy!
  console.log('\n9. Clicking Deploy...');
  const deployNowBtn = page.locator('[data-testid="deploy-btn"]');
  await deployNowBtn.click();
  console.log('   Deploy initiated!');

  // Step 10: Wait for result
  console.log('\n10. Waiting for deploy to complete...');
  try {
    await Promise.race([
      page.locator('[data-testid="pr-link"]').waitFor({ timeout: 60000 }),
      page.locator('[data-testid="deploy-error"]').waitFor({ timeout: 60000 }),
    ]);
  } catch {
    console.log('   Timeout!');
    await page.screenshot({ path: '/tmp/deploy-timeout.png' });
  }

  await page.screenshot({ path: '/tmp/deploy-08-result.png' });

  const prLink = page.locator('[data-testid="pr-link"]');
  const errorEl = page.locator('[data-testid="deploy-error"]');

  if (await prLink.isVisible({ timeout: 2000 })) {
    const href = await prLink.getAttribute('href');
    console.log(`\n   SUCCESS! PR created: ${href}`);
  } else if (await errorEl.isVisible({ timeout: 2000 })) {
    const errorText = await errorEl.textContent();
    console.log(`\n   DEPLOY ERROR: ${errorText}`);
  } else {
    console.log('\n   UNKNOWN STATE');
  }

  await browser.close();
  console.log('\n--- Test Complete ---');
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
