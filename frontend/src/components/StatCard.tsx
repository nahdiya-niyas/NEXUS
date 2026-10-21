import { type ReactNode } from "react";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon?: string;
  onClick?: () => void;
  href?: string;
}

export default function StatCard({ label, value, sub, accent, icon, onClick, href }: Props) {
  const content = (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <p className="stat-label">{label}</p>
        {icon && (
          <span
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "0.5rem",
              background: accent ? `${accent}15` : "var(--color-surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
            }}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="stat-value" style={accent ? { color: accent } : {}}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub && <p className="stat-sub">{sub}</p>}
    </>
  );

  const baseStyle: React.CSSProperties = {
    display: "block",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-xl)",
    padding: "1.125rem",
    boxShadow: "var(--shadow-sm)",
    textDecoration: "none",
    transition: "box-shadow 150ms, border-color 150ms",
    cursor: onClick || href ? "pointer" : "default",
  };

  if (href) {
    return (
      <a href={href} style={baseStyle}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent ?? "var(--color-border-2)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={onClick ? (e) => { e.currentTarget.style.borderColor = accent ?? "var(--color-border-2)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; } : undefined}
      onMouseLeave={onClick ? (e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; } : undefined}
    >
      {content}
    </div>
  );
}
