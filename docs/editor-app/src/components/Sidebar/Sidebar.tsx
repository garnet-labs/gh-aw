import { useState } from 'react';
import { NodePalette } from './NodePalette';
import { TemplateGallery } from './TemplateGallery';
import { useUIStore } from '../../stores/uiStore';

export function Sidebar() {
  const activeTab = useUIStore((s) => s.sidebarTab);
  const setActiveTab = useUIStore((s) => s.setSidebarTab);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--color-bg-default, #ffffff)',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border-default, #d0d7de)',
        flexShrink: 0,
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
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        padding: '10px 0',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        border: 'none',
        borderBottom: active
          ? '2px solid var(--color-accent-fg, #0969da)'
          : '2px solid transparent',
        background: hovered && !active ? 'var(--color-bg-subtle, #f6f8fa)' : 'none',
        color: active
          ? 'var(--color-fg-default, #1f2328)'
          : 'var(--color-fg-muted, #656d76)',
        cursor: 'pointer',
        transition: 'color 0.15s ease, border-color 0.15s ease, background 0.15s ease',
      }}
    >
      {label}
    </button>
  );
}
