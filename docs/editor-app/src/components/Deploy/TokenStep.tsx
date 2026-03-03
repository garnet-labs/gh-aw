import { useState } from 'react';
import { KeyRound, ExternalLink, Loader2 } from 'lucide-react';
import { useDeployStore } from '../../stores/deployStore';
import { validateToken } from '../../utils/githubApi';

export function TokenStep() {
  const setToken = useDeployStore((s) => s.setToken);
  const setStep = useDeployStore((s) => s.setStep);
  const rememberToken = useDeployStore((s) => s.rememberToken);
  const setRememberToken = useDeployStore((s) => s.setRememberToken);
  const closeDialog = useDeployStore((s) => s.closeDialog);
  const storeError = useDeployStore((s) => s.error);

  const [input, setInput] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(storeError);

  const handleContinue = async () => {
    if (!input.trim()) return;
    setValidating(true);
    setError(null);
    try {
      const user = await validateToken(input.trim());
      setToken(input.trim(), user.login);
      setStep('repo');
    } catch {
      setError('Invalid token. Please check and try again.');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <KeyRound size={16} style={{ color: 'var(--color-fg-muted, #656d76)' }} />
        <span style={{ fontSize: 13, color: 'var(--color-fg-muted, #656d76)' }}>
          To deploy workflows, you need a GitHub Personal Access Token with{' '}
          <code style={{ fontSize: 12, background: 'var(--color-bg-subtle, #f6f8fa)', padding: '1px 4px', borderRadius: 3 }}>repo</code> and{' '}
          <code style={{ fontSize: 12, background: 'var(--color-bg-subtle, #f6f8fa)', padding: '1px 4px', borderRadius: 3 }}>workflow</code> scopes.
        </span>
      </div>

      <a
        href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=gh-aw-editor-deploy"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 13, color: 'var(--color-accent-fg, #0969da)',
          textDecoration: 'none',
        }}
      >
        Create a token on GitHub <ExternalLink size={12} />
      </a>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--color-fg-default, #1f2328)' }}>
          Token
        </label>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleContinue(); }}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          data-testid="token-input"
          style={inputStyle}
          autoFocus
        />
      </div>

      {error && (
        <div style={{ fontSize: 12, color: 'var(--color-danger-fg, #cf222e)' }} data-testid="token-error">
          {error}
        </div>
      )}

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-fg-default, #1f2328)', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={rememberToken}
          onChange={(e) => setRememberToken(e.target.checked)}
        />
        Remember this token
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
        <button onClick={closeDialog} style={secondaryBtnStyle}>
          Cancel
        </button>
        <button
          onClick={handleContinue}
          disabled={!input.trim() || validating}
          style={{ ...primaryBtnStyle, opacity: !input.trim() || validating ? 0.5 : 1 }}
          data-testid="save-continue-btn"
        >
          {validating ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Validating...</> : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  fontSize: 13,
  fontFamily: 'monospace',
  border: '1px solid var(--color-border-default, #d0d7de)',
  borderRadius: 6,
  background: 'var(--color-bg-default, #ffffff)',
  color: 'var(--color-fg-default, #1f2328)',
  outline: 'none',
  boxSizing: 'border-box',
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
