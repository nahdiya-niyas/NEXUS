import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

/* ── helpers ─────────────────────────────────────────────── */

function SideLink({
  to,
  icon,
  label,
  end,
}: {
  to: string;
  icon: string;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        "sidebar-link" + (isActive ? " active" : "")
      }
    >
      <span className="icon">{icon}</span>
      {label}
    </NavLink>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <p className="sidebar-section-label">{label}</p>;
}

/* ── role-specific nav ───────────────────────────────────── */

function StudentNav() {
  return (
    <>
      <SectionLabel label="Student" />
      <SideLink to="/dashboard"     icon="⊞"  label="Dashboard"     end />
      <SideLink to="/modules"       icon="📚"  label="Modules"       />
      <SideLink to="/assignments"   icon="📝"  label="Assignments"   />
      <SideLink to="/calendar"      icon="📅"  label="Calendar"      />
      <SectionLabel label="Files" />
      <SideLink to="/private-files" icon="🔒"  label="Private Files" />
      <SectionLabel label="Account" />
      <SideLink to="/profile"       icon="👤"  label="Profile"       />
      <SideLink to="/messages"      icon="💬"  label="Messages"      />
    </>
  );
}

function LecturerNav() {
  return (
    <>
      <SectionLabel label="Lecturer" />
      <SideLink to="/lecturer-dashboard"  icon="⊞"  label="Dashboard"   end />
      <SideLink to="/lecturer/modules"    icon="📚"  label="My Modules"  />
      <SideLink to="/lecturer/assignments" icon="📝" label="Assignments" />
      <SideLink to="/lecturer/resources"  icon="📂"  label="Resources"   />
      <SideLink to="/lecturer/submissions" icon="📥" label="Submissions" />
    </>
  );
}

function AdminNav() {
  return (
    <>
      <SectionLabel label="Admin" />
      <SideLink to="/admin-dashboard"    icon="⊞"  label="Dashboard"   end />
      <SideLink to="/admin/users"        icon="👥"  label="Users"       />
      <SideLink to="/admin/modules"      icon="📚"  label="Modules"     />
      <SideLink to="/admin/enrollments"  icon="🎓"  label="Enrollments" />
      <SectionLabel label="Analytics" />
      <SideLink to="/admin/reports"      icon="📊"  label="Reports"     />
      <SectionLabel label="Account" />
      <SideLink to="/admin/settings"     icon="⚙️"  label="Settings"    />
    </>
  );
}

/* ── accent colour per role ──────────────────────────────── */

const roleAccent: Record<string, string> = {
  STUDENT:  "#2563eb",
  LECTURER: "#4f46e5",
  ADMIN:    "#7c3aed",
};

const roleLabel: Record<string, string> = {
  STUDENT:  "Student",
  LECTURER: "Lecturer",
  ADMIN:    "Administrator",
};

/* ── main sidebar ────────────────────────────────────────── */

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const accent = roleAccent[user?.role ?? "STUDENT"];
  const roleName = roleLabel[user?.role ?? "STUDENT"];

  function confirmLogout() {
    setShowLogout(false);
    logout();
    navigate("/login");
  }

  return (
    <>
      <aside className="app-sidebar">

        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "0.5rem",
                background: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
              }}
            >
              N
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text)", lineHeight: 1 }}>
                NEXUS
              </p>
              <p style={{ fontSize: "0.6875rem", color: "var(--color-text-4)", marginTop: "0.125rem" }}>
                {roleName}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {user?.role === "STUDENT"  && <StudentNav />}
          {user?.role === "LECTURER" && <LecturerNav />}
          {user?.role === "ADMIN"    && <AdminNav />}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <button
            type="button"
            onClick={() => setShowLogout(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              width: "100%",
              padding: "0.5rem 0.625rem",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 120ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "9999px",
                background: accent + "20",
                border: `1px solid ${accent}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: accent,
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name}
              </p>
              <p style={{ fontSize: "0.6875rem", color: "var(--color-text-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email}
              </p>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-4)" }}>↪</span>
          </button>
        </div>

      </aside>

      {/* Logout modal */}
      {showLogout && (
        <div className="modal-backdrop">
          <div className="modal">
            <div
              style={{
                width: "2.75rem", height: "2.75rem",
                borderRadius: "9999px",
                background: "var(--color-danger-light)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.25rem", marginBottom: "1rem",
              }}
            >
              🚪
            </div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text)" }}>
              Sign out?
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)", marginTop: "0.375rem" }}>
              You will be signed out of your {roleName} account.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.625rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowLogout(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmLogout}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
