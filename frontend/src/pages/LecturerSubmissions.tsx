import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";

interface Module { id: number; code: string; name: string; description?: string | null; credits: number; _count: { enrollments: number; assignments: number; resources: number; }; }

export default function LecturerSubmissions() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/lecturer/modules").then(r => setModules(r.data.modules || [])).catch(e => setError(e.response?.data?.message || "Failed to load")).finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <PageHeader title="Submissions" description="Select a module to view its assignment submissions." />

      {loading ? (
        <div className="card"><div style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div></div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : modules.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">📚</div><p className="empty-title">No modules assigned</p></div></div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Module</th>
                <th style={{ width: "110px", textAlign: "center" }}>Students</th>
                <th style={{ width: "120px", textAlign: "center" }}>Assignments</th>
                <th style={{ width: "80px" }}></th>
              </tr>
            </thead>
            <tbody>
              {modules.map(m => (
                <tr key={m.id}>
                  <td>
                    <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--color-lecturer)" }}>{m.code}</p>
                    <p style={{ fontWeight: 500, color: "var(--color-text)" }}>{m.name}</p>
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 600 }}>{m._count.enrollments}</td>
                  <td style={{ textAlign: "center", fontWeight: 600 }}>{m._count.assignments}</td>
                  <td><Link to={`/lecturer/submissions/${m.id}`} className="btn btn-secondary btn-sm">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
