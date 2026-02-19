import { useWorkflowStore } from '../../stores/workflowStore';
import { PanelContainer } from './PanelContainer';
import { getFieldDescription } from '../../utils/fieldDescriptions';
import { HelpTooltip } from '../shared/HelpTooltip';
import type { PermissionScope, PermissionLevel } from '../../types/workflow';

const scopes: PermissionScope[] = [
  'actions',
  'attestations',
  'checks',
  'contents',
  'deployments',
  'discussions',
  'id-token',
  'issues',
  'models',
  'metadata',
  'packages',
  'pages',
  'pull-requests',
  'security-events',
  'statuses',
];

const levels: PermissionLevel[] = ['read', 'write'];

export function PermissionsPanel() {
  const permissions = useWorkflowStore((s) => s.permissions);
  const setPermissions = useWorkflowStore((s) => s.setPermissions);
  const desc = getFieldDescription('permissions');

  const setLevel = (scope: PermissionScope, level: PermissionLevel) => {
    setPermissions({ [scope]: level });
  };

  return (
    <PanelContainer title={desc.label} description={desc.description}>
      <div className="panel__info" style={{ marginTop: 0, marginBottom: '16px' }}>
        {desc.tooltip}
      </div>

      <div style={tableStyle}>
        {/* Header */}
        <div style={headerRowStyle}>
          <div style={{ flex: 1 }}>Scope</div>
          {levels.map((l) => (
            <div key={l} style={headerCellStyle}>{capitalize(l)}</div>
          ))}
        </div>

        {/* Rows */}
        {scopes.map((scope) => {
          const fd = getFieldDescription(`permission.${scope}`);
          const current = permissions[scope] ?? 'read';
          return (
            <div key={scope} style={rowStyle}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {fd.label || formatScope(scope)}
                  {fd.description && (
                    <HelpTooltip text={fd.description} />
                  )}
                </div>
              </div>
              <div style={segmentedControlStyle}>
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setLevel(scope, level)}
                    style={{
                      ...segmentButtonStyle,
                      ...(current === level ? activeSegmentStyle(level) : {}),
                    }}
                  >
                    {capitalize(level)}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PanelContainer>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatScope(scope: string): string {
  return scope.split('-').map(capitalize).join(' ');
}

function activeSegmentStyle(level: PermissionLevel): React.CSSProperties {
  switch (level) {
    case 'write':
      return { backgroundColor: '#ddf4ff', color: '#0969da', borderColor: '#0969da' };
    case 'read':
    default:
      return { backgroundColor: '#dafbe1', color: '#1a7f37', borderColor: '#1a7f37' };
  }
}

const tableStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '2px solid #d0d7de',
  fontSize: '11px',
  fontWeight: 600,
  color: '#656d76',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const headerCellStyle: React.CSSProperties = {
  width: '54px',
  textAlign: 'center',
  flexShrink: 0,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: '1px solid #f0f0f0',
  gap: '10px',
};

const segmentedControlStyle: React.CSSProperties = {
  display: 'flex',
  flexShrink: 0,
};

const segmentButtonStyle: React.CSSProperties = {
  padding: '4px 10px',
  fontSize: '11px',
  fontWeight: 500,
  border: '1px solid #d0d7de',
  background: '#ffffff',
  color: '#656d76',
  cursor: 'pointer',
  transition: 'background 150ms ease, color 150ms ease',
  marginLeft: '-1px',
};
