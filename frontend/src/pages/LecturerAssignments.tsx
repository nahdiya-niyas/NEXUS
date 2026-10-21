import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";

interface Assignment {
  id: number; title: string; description: string | null; deadline: string; fileName: string | null;
  module: { id: number; code: string; name: string; };
  _count: { submissions: number; };
}

export default function LecturerAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/lecturer/assignments").then(r => setAssignments(r.data.assignments || [])).catch(e => setError(e.response?.data?.message || "Failed to load")).finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Assignments"
        description="Create and manage assignments for your modules."
        action={
          <Link to="/lecturer/assignments/create" className="btn btn-primary">+ Create Assignment</Link>
        }
      />

      {loading ? (
        <div className="card"><div style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div></div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : assignments.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p className="empty-title">No assignments yet</p>
            <p className="empty-description">Create your first assignment to get started.</p>
            <Link to="/lecturer/assignments/create" className="btn btn-primary" style={{ marginTop: "0.75rem", display: "inline-flex" }}>Create Assignment</Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Module</th>
                <th style={{ width: "160px" }}>Deadline</th>
                <th style={{ width: "100px", textAlign: "center" }}>Submissions</th>
                <th style={{ width: "110px", textAlign: "center" }}>Document</th>
                <th style={{ width: "70px" }}></th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => {
                const past = new Date(a.deadline) < new Date();
                return (
                  <tr key={a.id}>
                    <td>
                      <p style={{ fontWeight: 500, color: "var(--color-text)" }}>{a.title}</p>
                      {a.description && <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)", marginTop: "0.125rem" }}>{a.description.slice(0, 70)}{a.description.length > 70 ? "…" : ""}</p>}
                    </td>
                    <td><span className="badge badge-indigo">{a.module.code}</span></td>
                    <td>
                      <p style={{ fontSize: "0.8125rem", color: past ? "var(--color-text-3)" : "var(--color-text-2)" }}>{new Date(a.deadline).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>
                      {past ? <span className="badge badge-gray">Closed</span> : <span className="badge badge-yellow">Open</span>}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 600, color: "var(--color-text)" }}>{a._count.submissions}</td>
                    <td style={{ textAlign: "center" }}>{a.fileName ? <span className="badge badge-green">Yes</span> : <span className="badge badge-gray">None</span>}</td>
                    <td><Link to={`/lecturer/assignments/${a.id}`} className="btn btn-secondary btn-sm">View</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
