import { useEffect, useState } from "react";
import { api } from "../services/api";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";

interface TopModule { id: number; code: string; name: string; lecturer: { name: string } | null; _count: { enrollments: number; assignments: number; }; }
interface ActiveStudent { id: number; name: string; email: string; _count: { submissions: number; enrollments: number; }; }
interface RecentSubmission { id: number; submittedAt: string; status: "SUBMITTED" | "LATE"; student: { name: string; email: string; }; assignment: { title: string; module: { code: string; name: string; }; }; }
interface Data { topModules: TopModule[]; submissionStats: { onTime: number; late: number; }; activeStudents: ActiveStudent[]; recentSubmissions: RecentSubmission[]; }

export default function AdminReports() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/reports").then(r => setData(r.data)).catch(e => setError(e.response?.data?.message || "Failed to load reports")).finally(() => setLoading(false));
  }, []);

  if (loading) return <AppShell><div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading reports…</div></AppShell>;
  if (error || !data) return <AppShell><PageHeader title="Reports" /><div className="alert alert-danger">{error || "Failed to load"}</div><button className="btn btn-secondary" style={{ marginTop: "1rem" }} onClick={() => window.location.reload()}>Try again</button></AppShell>;

  const total = data.submissionStats.onTime + data.submissionStats.late;
  const onTimePct = total > 0 ? Math.round((data.submissionStats.onTime / total) * 100) : 0;

  return (
    <AppShell>
      <PageHeader title="Reports" description="Monitor platform activity, submission rates, and student engagement." />

      {/* Submission stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
        <StatCard label="Total Submissions" value={total} icon="📥" />
        <StatCard label="On Time" value={data.submissionStats.onTime} icon="✅" accent="var(--color-success)" sub={`${onTimePct}% of all submissions`} />
        <StatCard label="Late" value={data.submissionStats.late} icon="⚠️" accent="var(--color-warning)" sub={`${100 - onTimePct}% of all submissions`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>

        {/* Top modules */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Top Modules by Enrollment</h2></div>
          <table className="data-table">
            <thead><tr><th>#</th><th>Module</th><th style={{ width: "90px", textAlign: "center" }}>Students</th><th style={{ width: "100px", textAlign: "center" }}>Assignments</th></tr></thead>
            <tbody>
              {data.topModules.map((m, i) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 700, color: "var(--color-text-3)", width: "40px" }}>{i + 1}</td>
                  <td><p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--color-lecturer)" }}>{m.code}</p><p style={{ fontSize: "0.875rem", color: "var(--color-text-2)" }}>{m.name}</p></td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{m._count.enrollments}</td>
                  <td style={{ textAlign: "center", color: "var(--color-text-3)" }}>{m._count.assignments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Active students */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Most Active Students</h2></div>
          <table className="data-table">
            <thead><tr><th>#</th><th>Student</th><th style={{ width: "100px", textAlign: "center" }}>Submissions</th><th style={{ width: "90px", textAlign: "center" }}>Modules</th></tr></thead>
            <tbody>
              {data.activeStudents.length === 0
                ? <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--color-text-4)", padding: "2rem" }}>No submissions yet</td></tr>
                : data.activeStudents.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: "var(--color-text-3)", width: "40px" }}>{i + 1}</td>
                    <td><p style={{ fontWeight: 500, color: "var(--color-text)" }}>{s.name}</p><p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>{s.email}</p></td>
                    <td style={{ textAlign: "center", fontWeight: 700 }}>{s._count.submissions}</td>
                    <td style={{ textAlign: "center", color: "var(--color-text-3)" }}>{s._count.enrollments}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

      </div>

      {/* Recent submissions */}
      <div className="card">
        <div className="card-header"><h2 className="card-title">Recent Submissions</h2><span className="badge badge-gray">Last 10</span></div>
        {data.recentSubmissions.length === 0 ? (
          <div className="empty-state"><p className="empty-title">No submissions yet</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Student</th><th>Assignment</th><th style={{ width: "90px", textAlign: "center" }}>Status</th><th style={{ width: "130px" }}>Submitted</th></tr></thead>
            <tbody>
              {data.recentSubmissions.map(s => (
                <tr key={s.id}>
                  <td><p style={{ fontWeight: 500, color: "var(--color-text)" }}>{s.student.name}</p><p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>{s.student.email}</p></td>
                  <td><p style={{ fontWeight: 500, color: "var(--color-text-2)" }}>{s.assignment.title}</p><span className="badge badge-indigo">{s.assignment.module.code}</span></td>
                  <td style={{ textAlign: "center" }}><span className={`badge ${s.status === "LATE" ? "badge-yellow" : "badge-green"}`}>{s.status === "LATE" ? "Late" : "On time"}</span></td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--color-text-3)" }}>{new Date(s.submittedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
