import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  text: string;
}

export function HelpTooltip({ text }: HelpTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <HelpCircle size={14} color="#656d76" style={{ cursor: 'help' }} />
      {visible && (
        <div style={tooltipStyle}>
          {text}
          <div style={arrowStyle} />
        </div>
      )}
    </span>
  );
}

const tooltipStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  marginBottom: '8px',
  padding: '6px 10px',
  backgroundColor: '#1f2328',
  color: '#ffffff',
  fontSize: '12px',
  lineHeight: '1.4',
  borderRadius: '6px',
  whiteSpace: 'normal',
  width: '220px',
  zIndex: 100,
  pointerEvents: 'none',
};

const arrowStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 0,
  height: 0,
  borderLeft: '5px solid transparent',
  borderRight: '5px solid transparent',
  borderTop: '5px solid #1f2328',
};
