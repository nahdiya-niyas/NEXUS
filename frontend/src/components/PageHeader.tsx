import { type ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  backButton?: ReactNode;
}

export default function PageHeader({ eyebrow, title, description, action, backButton }: Props) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {backButton && (
        <div style={{ marginBottom: "0.75rem" }}>
          {backButton}
        </div>
      )}
      <div className="page-header">
        <div>
          {eyebrow && (
            <p className="page-eyebrow" style={{ color: "var(--color-text-3)" }}>
              {eyebrow}
            </p>
          )}
          <h1 className="page-title">{title}</h1>
          {description && (
            <p className="page-description">{description}</p>
          )}
        </div>
        {action && (
          <div style={{ flexShrink: 0 }}>{action}</div>
        )}
      </div>
    </div>
  );
}
