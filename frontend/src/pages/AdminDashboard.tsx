import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import AppShell from "../components/AppShell";
import StatCard from "../components/StatCard";

interface Stats { totalStudents: number; totalLecturers: number; totalAdmins: number; totalModules: number; totalAssignments: number; totalSubmissions: number; totalEnrollments: number; }
interface RecentUser { id: number; name: string; email: string; role: "STUDENT" | "LECTURER" | "ADMIN"; createdAt: string; }
interface RecentModule { id: number; code: string; name: string; createdAt: string; lecturer: { name: string } | null; _count: { enrollments: number }; }

const roleColors: Record<string, string> = { ADMIN: "badge-violet", LECTURER: "badge-indigo", STUDENT: "badge-blue" };

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentModules, setRecentModules] = useState<RecentModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/stats").then(r => { setStats(r.data.stats); setRecentUsers(r.data.recentUsers); setRecentModules(r.data.recentModules); }).catch(e => setError(e.response?.data?.message || "Failed to load")).finally(() => setLoading(false));
  }, []);

  if (loading) return <AppShell><div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div></AppShell>;
  if (error || !stats) return <AppShell><div className="alert alert-danger">{error || "Failed to load"}</div></AppShell>;

  return (
    <AppShell>
      <div style={{ marginBottom: "1.75rem" }}>
        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", marginBottom: "0.25rem" }}>Admin Panel</p>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Platform-wide overview and statistics.</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
        <StatCard label="Students" value={stats.totalStudents} icon="🎓" accent="var(--color-student)" href="/admin/users?role=STUDENT" />
        <StatCard label="Lecturers" value={stats.totalLecturers} icon="👨‍🏫" accent="var(--color-lecturer)" href="/admin/users?role=LECTURER" />
        <StatCard label="Modules" value={stats.totalModules} icon="📚" accent="var(--color-admin)" href="/admin/modules" />
        <StatCard label="Assignments" value={stats.totalAssignments} icon="📝" />
        <StatCard label="Submissions" value={stats.totalSubmissions} icon="📥" />
        <StatCard label="Enrollments" value={stats.totalEnrollments} icon="🔗" href="/admin/enrollments" />
        <StatCard label="Total Users" value={stats.totalStudents + stats.totalLecturers + stats.totalAdmins} icon="👥" href="/admin/users" />
        <StatCard label="Admins" value={stats.totalAdmins} icon="🛡️" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

        {/* Recent users */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recently Registered</h2>
            <Link to="/admin/users" style={{ fontSize: "0.8125rem", color: "var(--color-admin)", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          <div>
            {recentUsers.map(u => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "9999px", background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-2)", flexShrink: 0 }}>{u.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text)" }}>{u.name}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>{u.email}</p>
                  </div>
                </div>
                <span className={`badge ${roleColors[u.role]}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent modules */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Modules</h2>
            <Link to="/admin/modules" style={{ fontSize: "0.8125rem", color: "var(--color-admin)", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          <div>
            {recentModules.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--color-border)" }}>
                <div>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-lecturer)" }}>{m.code}</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-2)" }}>{m.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>{m.lecturer ? m.lecturer.name : "No lecturer"}</p>
                </div>
                <span className="badge badge-gray">{m._count.enrollments} enrolled</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
