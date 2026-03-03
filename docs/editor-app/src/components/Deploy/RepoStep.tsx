import { useState, useMemo } from 'react';
import { GitBranch, Loader2 } from 'lucide-react';
import { useDeployStore } from '../../stores/deployStore';
import { useWorkflowStore } from '../../stores/workflowStore';
import { generateMarkdown } from '../../utils/markdownGenerator';
import { compile, isCompilerReady } from '../../utils/compiler';
import { runDeploy } from '../../utils/deploy';

const REPO_REGEX = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
const BRANCH_INVALID = /(\.\.|[ ~^:\\]|\.lock$)/;

export function RepoStep() {
  const store = useDeployStore();
  const {
    username,
    repoSlug,
    branchName,
    baseBranch,
    setRepoSlug,
    setBranchName,
    setBaseBranch,
    setStep,
    closeDialog,
    clearToken,
    isDeploying,
    setIsDeploying,
    initProgress,
  } = store;

  const workflowName = useWorkflowStore((s) => s.name);
  const [deploying, setDeploying] = useState(false);

  // Auto-derive branch name from workflow name
  const derivedBranch = useMemo(() => {
    if (branchName) return branchName;
    if (workflowName) return `aw/${workflowName}`;
    return 'aw/workflow';
  }, [branchName, workflowName]);

  const repoValid = REPO_REGEX.test(repoSlug);
  const branchValid = derivedBranch.length > 0 && !BRANCH_INVALID.test(derivedBranch);
  const canDeploy = repoValid && branchValid && !deploying && !isDeploying;

  const handleDeploy = async () => {
    if (!canDeploy) return;
    setDeploying(true);
    setIsDeploying(true);

    // Generate markdown RIGHT HERE from current workflow state
    const wfState = useWorkflowStore.getState();
    const markdown = generateMarkdown(wfState);

    // Try to get compiled YAML
    let yaml = wfState.compiledYaml || '';
    if (!yaml && isCompilerReady()) {
      try {
        const result = await Promise.race([
          compile(markdown),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Compile timeout')), 10000),
          ),
        ]);
        yaml = result.yaml || '';
      } catch {
        // Compile failed or timed out
      }
    }

    if (!yaml) {
      useDeployStore.getState().setError('No compiled YAML available. Make sure your workflow compiles successfully first.');
      setDeploying(false);
      return;
    }

    if (!markdown) {
      useDeployStore.getState().setError('No workflow markdown available.');
      setDeploying(false);
      return;
    }

    // Switch to progress view and initialize
    const finalBranch = branchName || derivedBranch;
    setBranchName(finalBranch);
    initProgress();
    setStep('deploying');

    // Run deploy with a fresh store reference
    const currentStore = useDeployStore.getState();
    await runDeploy(currentStore, markdown, yaml, wfState.name || 'workflow');
    setDeploying(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Logged in as */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--color-fg-muted, #656d76)' }}>
          Logged in as <strong>{username}</strong>
        </span>
        <button onClick={clearToken} style={{ fontSize: 12, color: 'var(--color-danger-fg, #cf222e)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          Clear token
        </button>
      </div>

      {/* Repository */}
      <div>
        <label style={labelStyle}>Repository</label>
        <input
          value={repoSlug}
          onChange={(e) => setRepoSlug(e.target.value)}
          placeholder="owner/repo"
          data-testid="repo-input"
          style={inputStyle}
        />
        {repoSlug && !repoValid && (
          <div style={errorHintStyle}>Enter a valid repository in the format <code>owner/repo</code>.</div>
        )}
      </div>

      {/* Branch name */}
      <div>
        <label style={labelStyle}>
          <GitBranch size={12} style={{ marginRight: 4 }} />
          Branch name
        </label>
        <input
          value={branchName || derivedBranch}
          onChange={(e) => setBranchName(e.target.value)}
          placeholder="aw/my-workflow"
          data-testid="branch-input"
          style={inputStyle}
        />
        {(branchName || derivedBranch) && !branchValid && (
          <div style={errorHintStyle}>Invalid branch name.</div>
        )}
      </div>

      {/* Base branch */}
      <div>
        <label style={labelStyle}>Base branch</label>
        <input
          value={baseBranch}
          onChange={(e) => setBaseBranch(e.target.value)}
          placeholder="main"
          data-testid="base-branch-input"
          style={inputStyle}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
        <button onClick={closeDialog} style={secondaryBtnStyle}>
          Cancel
        </button>
        <button
          onClick={handleDeploy}
          disabled={!canDeploy}
          style={{ ...primaryBtnStyle, opacity: canDeploy ? 1 : 0.5 }}
          data-testid="deploy-btn"
        >
          {deploying ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Deploying...</> : 'Deploy'}
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center',
  fontSize: 12, fontWeight: 600, marginBottom: 4,
  color: 'var(--color-fg-default, #1f2328)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  fontSize: 13,
  border: '1px solid var(--color-border-default, #d0d7de)',
  borderRadius: 6,
  background: 'var(--color-bg-default, #ffffff)',
  color: 'var(--color-fg-default, #1f2328)',
  outline: 'none',
  boxSizing: 'border-box',
};

const errorHintStyle: React.CSSProperties = {
  fontSize: 11, color: 'var(--color-danger-fg, #cf222e)', marginTop: 4,
};

const primaryBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', fontSize: 13, fontWeight: 600,
  border: 'none', borderRadius: 6, cursor: 'pointer',
  background: 'var(--color-btn-primary-bg, #1f883d)',
  color: '#ffffff',
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: '8px 16px', fontSize: 13, fontWeight: 500,
  border: '1px solid var(--color-border-default, #d0d7de)', borderRadius: 6,
  background: 'var(--color-bg-default, #ffffff)',
  color: 'var(--color-fg-default, #1f2328)', cursor: 'pointer',
};
