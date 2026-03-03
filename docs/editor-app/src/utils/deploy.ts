import type { DeployStore } from '../stores/deployStore';
import {
  getRepo,
  getDefaultBranchSha,
  createBranch,
  createOrUpdateFile,
  createPullRequest,
} from './githubApi';

function escapeGitHubExpressions(text: string): string {
  // Escape ${{ }} patterns to prevent injection in PR body
  return text.replace(/\$\{\{/g, '`${{`').replace(/\}\}/g, '`}}`');
}

function sanitizeWorkflowName(name: string): string {
  // Strip path traversal and restrict to safe filename characters
  return name
    .replace(/\.\./g, '')
    .replace(/[/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/^[.-]+/, '')     // no leading dots or dashes
    .slice(0, 100)             // reasonable length limit
    || 'workflow';             // fallback if empty after sanitization
}

export async function runDeploy(
  store: DeployStore,
  markdown: string,
  yaml: string,
  workflowName: string,
): Promise<void> {
  const { token, repoSlug, branchName, baseBranch } = store;
  if (!token) {
    store.setError('No token available');
    return;
  }

  const parts = repoSlug.split('/');
  if (parts.length !== 2) {
    store.setError('Invalid repository slug');
    return;
  }
  const [owner, repo] = parts;
  const safeName = sanitizeWorkflowName(workflowName);
  const mdPath = `.github/workflows/${safeName}.md`;
  const ymlPath = `.github/workflows/${safeName}.lock.yml`;

  try {
    // Step 1: Verify repo access
    store.updateProgress('verify', { status: 'running' });
    const repoData = await getRepo(token, owner, repo);
    if (!repoData.permissions?.push) {
      throw new Error(
        `You don't have push permission to ${owner}/${repo}. Ensure your token has the 'repo' scope.`,
      );
    }
    store.updateProgress('verify', { status: 'done' });

    // Step 2: Create branch
    store.updateProgress('branch', { status: 'running' });
    const actualBase = baseBranch || repoData.default_branch;
    const sha = await getDefaultBranchSha(token, owner, repo, actualBase);
    try {
      await createBranch(token, owner, repo, branchName, sha);
    } catch (err) {
      const e = err as Error & { status?: number };
      if (e.status === 422) {
        throw new Error(
          `Branch '${branchName}' already exists. Change the branch name or delete the existing branch on GitHub.`,
        );
      }
      throw err;
    }
    store.updateProgress('branch', { status: 'done' });

    // Step 3: Upload .md file
    store.updateProgress('upload-md', { status: 'running' });
    await createOrUpdateFile(
      token,
      owner,
      repo,
      mdPath,
      markdown,
      `Add agentic workflow source: ${safeName}`,
      branchName,
    );
    store.updateProgress('upload-md', { status: 'done' });

    // Step 4: Upload .lock.yml file
    store.updateProgress('upload-yml', { status: 'running' });
    await createOrUpdateFile(
      token,
      owner,
      repo,
      ymlPath,
      yaml,
      `Add compiled workflow: ${safeName}`,
      branchName,
    );
    store.updateProgress('upload-yml', { status: 'done' });

    // Step 5: Create PR
    store.updateProgress('pr', { status: 'running' });
    const safeDesc = escapeGitHubExpressions(
      `This PR adds the **${safeName}** agentic workflow.`,
    );
    const prBody = [
      `## Add Agentic Workflow: ${escapeGitHubExpressions(safeName)}`,
      '',
      safeDesc,
      '',
      '### Files',
      `- \`${mdPath}\` -- Workflow source (edit this)`,
      `- \`${ymlPath}\` -- Compiled output (auto-generated)`,
      '',
      '### Next Steps',
      '1. Review the workflow configuration',
      '2. Merge this PR to activate the workflow',
      '',
      '---',
      '*Deployed from [gh-aw Visual Editor](https://mossaka.github.io/gh-aw-editor-visualizer/)*',
    ].join('\n');

    const pr = await createPullRequest(
      token,
      owner,
      repo,
      `Add Agentic Workflow: ${safeName}`,
      branchName,
      actualBase,
      prBody,
    );
    store.updateProgress('pr', { status: 'done' });
    store.setSuccess(pr.html_url);
  } catch (err) {
    const e = err as Error & { status?: number };
    // Mark the currently running step as error
    const currentProgress = store.progress;
    const runningStep = currentProgress.find((p) => p.status === 'running');
    if (runningStep) {
      store.updateProgress(runningStep.id, {
        status: 'error',
        error: e.message,
      });
    }

    // Build user-friendly error message
    let msg = e.message || 'An unexpected error occurred';
    if (e.status === 401) {
      msg = 'Your token is invalid or expired. Please enter a new one.';
      store.clearToken();
    } else if (e.status === 403) {
      msg = `Your token doesn't have permission to push to this repository. Ensure your token has 'repo' and 'workflow' scopes.`;
    } else if (e.status === 404) {
      msg = `Repository '${owner}/${repo}' not found. Check the name and your token's access.`;
    } else if (!e.status) {
      msg = 'Network error -- check your internet connection and try again.';
    }

    store.setError(msg);
  }
}
