import type { ReactNode } from 'react';

interface PanelContainerProps {
  title: string;
  icon?: ReactNode;
  description?: string;
  children: ReactNode;
}

export function PanelContainer({ title, description, children }: PanelContainerProps) {
  return (
    <div className="panel">
      <div className="panel__header">
        <span className="panel__title">{title}</span>
      </div>
      {description && <p className="panel__description">{description}</p>}
      {children}
    </div>
  );
}
