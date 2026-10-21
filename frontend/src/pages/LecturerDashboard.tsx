import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/AppShell";
import StatCard from "../components/StatCard";

interface LecturerProfile { id: number; name: string; email: string; role: string; createdAt: string; }
interface Module { id: number; code: string; name: string; credits: number; _count: { enrollments: number; assignments: number; resources: number; }; }
interface Assignment { id: number; title: string; deadline: string; module: { id: number; code: string; name: string; }; _count: { submissions: number; }; }
interface Data { profile: LecturerProfile; statistics: { modules: number; students: number; assignments: number; resources: number; }; modules: Module[]; assignments: Assignment[]; }

function fmt(d: string) { return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" }); }

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/lecturer/dashboard").then(r => setData(r.data)).catch(e => setError(e.response?.data?.message || "Failed to load")).finally(() => setLoading(false));
  }, []);

  if (!user) return null;
  if (loading) return <AppShell><div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div></AppShell>;
  if (error || !data) return <AppShell><div className="alert alert-danger">{error || "Failed to load"}</div></AppShell>;

  return (
    <AppShell>
      <div style={{ marginBottom: "1.75rem" }}>
        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", marginBottom: "0.25rem" }}>Lecturer Portal</p>
        <h1 className="page-title">Welcome back, {data.profile.name.split(" ")[0]}</h1>
        <p className="page-description">Manage your modules, assignments, and student work.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
        <StatCard label="Modules" value={data.statistics.modules} icon="📚" accent="var(--color-lecturer)" />
        <StatCard label="Students" value={data.statistics.students} icon="🎓" />
        <StatCard label="Assignments" value={data.statistics.assignments} icon="📝" />
        <StatCard label="Resources" value={data.statistics.resources} icon="📂" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

        {/* Modules */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">My Modules</h2>
            <Link to="/lecturer/modules" style={{ fontSize: "0.8125rem", color: "var(--color-lecturer)", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          {data.modules.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📚</div><p className="empty-title">No modules assigned</p></div>
          ) : (
            <div>
              {data.modules.slice(0, 5).map(m => (
                <Link key={m.id} to={`/lecturer/modules/${m.id}`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--color-border)", textDecoration: "none", transition: "background 120ms" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-lecturer)" }}>{m.code}</p>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-2)", fontWeight: 500 }}>{m.name}</p>
                  </div>
                  <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
                    <span className="badge badge-gray">{m._count.enrollments} students</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Assignments */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Assignments</h2>
            <Link to="/lecturer/assignments" style={{ fontSize: "0.8125rem", color: "var(--color-lecturer)", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          {data.assignments.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📝</div><p className="empty-title">No assignments yet</p></div>
          ) : (
            <div>
              {data.assignments.slice(0, 5).map(a => {
                const past = new Date(a.deadline) < new Date();
                return (
                  <Link key={a.id} to={`/lecturer/assignments/${a.id}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--color-border)", textDecoration: "none", transition: "background 120ms" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <div>
                      <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text)" }}>{a.title}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>{a.module.code} · {fmt(a.deadline)}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem", flexShrink: 0 }}>
                      <span className="badge badge-gray">{a._count.submissions} submitted</span>
                      {!past && <span className="badge badge-yellow">Open</span>}
                      {past && <span className="badge badge-gray">Closed</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
