import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";

interface Module { id: number; code: string; name: string; description?: string | null; credits: number; _count: { enrollments: number; assignments: number; resources: number; }; }

export default function LecturerModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/lecturer/modules").then(r => setModules(r.data.modules || [])).catch(e => setError(e.response?.data?.message || "Failed to load")).finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <PageHeader title="My Modules" description="Modules assigned to you by the administration." />

      {loading ? (
        <div className="card"><div style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div></div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : modules.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <p className="empty-title">No modules assigned</p>
            <p className="empty-description">Contact your administrator to have modules assigned to your account.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Description</th>
                <th style={{ width: "90px", textAlign: "center" }}>Credits</th>
                <th style={{ width: "90px", textAlign: "center" }}>Students</th>
                <th style={{ width: "100px", textAlign: "center" }}>Assignments</th>
                <th style={{ width: "90px", textAlign: "center" }}>Resources</th>
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
                  <td style={{ color: "var(--color-text-3)", maxWidth: "260px" }}>
                    <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {m.description || "—"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}><span className="badge badge-gray">{m.credits}</span></td>
                  <td style={{ textAlign: "center", fontWeight: 600, color: "var(--color-text)" }}>{m._count.enrollments}</td>
                  <td style={{ textAlign: "center", fontWeight: 600, color: "var(--color-text)" }}>{m._count.assignments}</td>
                  <td style={{ textAlign: "center", fontWeight: 600, color: "var(--color-text)" }}>{m._count.resources}</td>
                  <td><Link to={`/lecturer/modules/${m.id}`} className="btn btn-secondary btn-sm">Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
