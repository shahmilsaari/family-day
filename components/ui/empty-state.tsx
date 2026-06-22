"use client";

import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
};

export function EmptyState({ icon, title, description, action, compact }: EmptyStateProps) {
  return (
    <div className={`empty-state-v2 ${compact ? "compact" : ""}`}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <strong className="empty-state-title">{title}</strong>
      {description && <p className="empty-state-description muted">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
