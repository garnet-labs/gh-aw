import { useState } from 'react';
import { NodePalette } from './NodePalette';
import { TemplateGallery } from './TemplateGallery';

type Tab = 'palette' | 'templates';

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<Tab>('palette');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bgColor-default, #ffffff)',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--borderColor-default, #d1d9e0)',
      }}>
        <TabButton
          label="Blocks"
          active={activeTab === 'palette'}
          onClick={() => setActiveTab('palette')}
        />
        <TabButton
          label="Templates"
          active={activeTab === 'templates'}
          onClick={() => setActiveTab('templates')}
        />
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'palette' ? <NodePalette /> : <TemplateGallery />}
      </div>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 0',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        border: 'none',
        borderBottom: active
          ? '2px solid var(--fgColor-accent, #0969da)'
          : '2px solid transparent',
        background: 'none',
        color: active
          ? 'var(--fgColor-default, #1f2328)'
          : 'var(--fgColor-muted, #656d76)',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
