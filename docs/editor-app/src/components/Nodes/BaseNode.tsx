import { memo, type ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';
import '../../styles/nodes.css';

interface BaseNodeProps {
  type: string;
  icon: ReactNode;
  title: string;
  selected?: boolean;
  dimmed?: boolean;
  children: ReactNode;
}

export const BaseNode = memo(function BaseNode({
  type,
  icon,
  title,
  selected = false,
  dimmed = false,
  children,
}: BaseNodeProps) {
  const classes = [
    'workflow-node',
    `node-${type}`,
    selected ? 'selected' : '',
    dimmed ? 'dimmed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className={classes}>
        <div className="workflow-node__header">
          <div className="workflow-node__icon">{icon}</div>
          <div className="workflow-node__title">{title}</div>
        </div>
        <div className="workflow-node__divider" />
        <div className="workflow-node__content">{children}</div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});
