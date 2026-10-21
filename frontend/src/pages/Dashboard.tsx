import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/AppShell";
import StatCard from "../components/StatCard";

interface Module { id: number; code: string; name: string; credits: number; }
interface Assignment {
  id: number; title: string; description: string | null; deadline: string;
  module: { id: number; code: string; name: string; };
}
interface DashboardData {
  profile: { id: number; name: string; email: string; role: string; createdAt: string; };
  enrolledModules: Module[];
  assignments: Assignment[];
}

function daysUntil(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true); setError("");
      const res = await api.get("/dashboard");
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally { setLoading(false); }
  }

  if (!user) return null;

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" }}>
          <p style={{ color: "var(--color-text-3)" }}>Loading…</p>
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "var(--color-danger)" }}>{error || "Unable to load dashboard"}</p>
          <button className="btn btn-secondary" style={{ marginTop: "1rem" }} onClick={load}>Try again</button>
        </div>
      </AppShell>
    );
  }

  const upcoming = data.assignments.filter(a => new Date(a.deadline) > new Date());

  return (
    <AppShell>
      {/* Welcome */}
      <div style={{ marginBottom: "1.75rem" }}>
        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", marginBottom: "0.25rem" }}>Student Dashboard</p>
        <h1 className="page-title">Welcome back, {data.profile.name.split(" ")[0]}</h1>
        <p className="page-description">Here's your academic summary for today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
        <StatCard label="Enrolled Modules" value={data.enrolledModules.length} icon="📚" accent="var(--color-student)" />
        <StatCard label="Upcoming Deadlines" value={upcoming.length} icon="📝" accent="#d97706" />
        <StatCard label="Account Since" value={new Date(data.profile.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })} icon="🎓" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

        {/* Enrolled modules */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Enrolled Modules</h2>
            <Link to="/modules" style={{ fontSize: "0.8125rem", color: "var(--color-student)", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          {data.enrolledModules.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <p className="empty-title">No modules yet</p>
              <p className="empty-description">Enrol in a module to get started.</p>
              <Link to="/modules" className="btn btn-primary" style={{ marginTop: "0.75rem", display: "inline-flex" }}>Browse modules</Link>
            </div>
          ) : (
            <div>
              {data.enrolledModules.slice(0, 5).map((m) => (
                <Link
                  key={m.id}
                  to={`/modules/${m.id}`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--color-border)", textDecoration: "none", transition: "background 120ms" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-student)" }}>{m.code}</p>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-2)", fontWeight: 500 }}>{m.name}</p>
                  </div>
                  <span className="badge badge-gray">{m.credits} cr</span>
                </Link>
              ))}
              {data.enrolledModules.length > 5 && (
                <div style={{ padding: "0.625rem 1.25rem" }}>
                  <Link to="/modules" style={{ fontSize: "0.8125rem", color: "var(--color-student)", textDecoration: "none" }}>
                    +{data.enrolledModules.length - 5} more modules
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upcoming assignments */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Deadlines</h2>
            <Link to="/assignments" style={{ fontSize: "0.8125rem", color: "var(--color-student)", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <p className="empty-title">All clear</p>
              <p className="empty-description">No upcoming deadlines.</p>
            </div>
          ) : (
            <div>
              {upcoming.slice(0, 5).map((a) => {
                const days = daysUntil(a.deadline);
                const urgent = days <= 3;
                return (
                  <Link
                    key={a.id}
                    to={`/assignments/${a.id}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--color-border)", textDecoration: "none", transition: "background 120ms" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>{a.module.code} · {fmtDate(a.deadline)}</p>
                    </div>
                    <span className={`badge ${urgent ? "badge-red" : "badge-yellow"}`} style={{ flexShrink: 0, marginLeft: "0.5rem" }}>
                      {days <= 0 ? "Today" : `${days}d`}
                    </span>
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
