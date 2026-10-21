import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import AppShell from "../components/AppShell";

interface Module { id: number; code: string; name: string; credits: number; }
interface Assignment { id: number; title: string; description?: string | null; deadline: string; module: { id: number; code: string; name: string; }; }

export default function LecturerSubmissionAssignments() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!moduleId) return;
    (async () => {
      try {
        const [modRes, asgRes] = await Promise.all([api.get("/lecturer/modules"), api.get("/lecturer/assignments")]);
        const mod = (modRes.data.modules || []).find((m: Module) => m.id === Number(moduleId));
        if (!mod) { setError("Module not found."); return; }
        setModule(mod);
        const filtered = (asgRes.data.assignments || []).filter((a: Assignment) => a.module.id === Number(moduleId)).sort((a: Assignment, b: Assignment) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        setAssignments(filtered);
      } catch (err: any) { setError(err.response?.data?.message || "Failed to load"); }
      finally { setLoading(false); }
    })();
  }, [moduleId]);

  if (loading) return <AppShell><div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div></AppShell>;
  if (error || !module) return (
    <AppShell>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: "1rem" }} onClick={() => navigate(-1)}>← Back</button>
      <div className="alert alert-danger">{error || "Module not found"}</div>
    </AppShell>
  );

  return (
    <AppShell>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: "1rem" }} onClick={() => navigate(-1)}>← Back to Submissions</button>

      <div style={{ marginBottom: "1.25rem" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-lecturer)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{module.code}</p>
        <h1 className="page-title" style={{ marginTop: "0.25rem" }}>{module.name}</h1>
        <p className="page-description">Select an assignment to view student submissions.</p>
      </div>

      {assignments.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">📝</div><p className="empty-title">No assignments</p></div></div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead><tr><th>Assignment</th><th style={{ width: "180px" }}>Deadline</th><th style={{ width: "70px" }}></th></tr></thead>
            <tbody>
              {assignments.map(a => {
                const past = new Date(a.deadline) < new Date();
                return (
                  <tr key={a.id}>
                    <td>
                      <p style={{ fontWeight: 500, color: "var(--color-text)" }}>{a.title}</p>
                      {a.description && <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)", marginTop: "0.125rem" }}>{a.description.slice(0, 80)}…</p>}
                    </td>
                    <td>
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-text-2)" }}>{new Date(a.deadline).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>
                      {past ? <span className="badge badge-gray">Closed</span> : <span className="badge badge-yellow">Open</span>}
                    </td>
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
