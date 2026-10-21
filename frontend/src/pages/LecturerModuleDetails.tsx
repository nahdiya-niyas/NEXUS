import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import AppShell from "../components/AppShell";

interface Student { id: number; name: string; email: string; }
interface Assignment { id: number; title: string; deadline: string; _count: { submissions: number; }; }
interface Resource { id: number; title: string; fileName: string; createdAt: string; }
interface Module {
  id: number; code: string; name: string; description?: string | null; credits: number;
  _count: { enrollments: number; assignments: number; resources: number; };
  enrollments: { id: number; student: Student; enrolledAt: string; }[];
  assignments: Assignment[];
  resources: Resource[];
}

export default function LecturerModuleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"students" | "assignments" | "resources">("students");

  useEffect(() => {
    api.get(`/lecturer/modules/${id}`).then(r => setModule(r.data.module)).catch(e => setError(e.response?.data?.message || "Failed to load")).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <AppShell><div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div></AppShell>;
  if (error || !module) return (
    <AppShell>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: "1rem" }} onClick={() => navigate(-1)}>← Back</button>
      <div className="alert alert-danger">{error || "Module not found"}</div>
    </AppShell>
  );

  const tabs = ["students", "assignments", "resources"] as const;

  return (
    <AppShell>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: "1rem" }} onClick={() => navigate(-1)}>← Back to Modules</button>

      {/* Header */}
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <div className="card-body" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-lecturer)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{module.code}</p>
              <h1 className="page-title" style={{ marginTop: "0.25rem" }}>{module.name}</h1>
              {module.description && <p className="page-description" style={{ maxWidth: "600px" }}>{module.description}</p>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <span className="badge badge-gray">{module.credits} credits</span>
              <span className="badge badge-indigo">{module._count.enrollments} students</span>
              <span className="badge badge-gray">{module._count.assignments} assignments</span>
              <span className="badge badge-gray">{module._count.resources} resources</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.125rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-lg)", padding: "0.25rem", marginBottom: "1.25rem", width: "fit-content" }}>
        {tabs.map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            style={{ padding: "0.375rem 0.875rem", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, transition: "background 120ms",
              background: tab === t ? "white" : "transparent", color: tab === t ? "var(--color-text)" : "var(--color-text-3)", boxShadow: tab === t ? "var(--shadow-sm)" : "none" }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Students */}
      {tab === "students" && (
        module.enrollments.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-icon">🎓</div><p className="empty-title">No students enrolled</p></div></div>
        ) : (
          <div className="card">
            <table className="data-table">
              <thead><tr><th>Student</th><th>Email</th><th style={{ width: "140px" }}>Enrolled</th></tr></thead>
              <tbody>
                {module.enrollments.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 500, color: "var(--color-text)" }}>{e.student.name}</td>
                    <td style={{ color: "var(--color-text-3)" }}>{e.student.email}</td>
                    <td style={{ color: "var(--color-text-3)", fontSize: "0.8125rem" }}>{new Date(e.enrolledAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Assignments */}
      {tab === "assignments" && (
        module.assignments.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-icon">📝</div><p className="empty-title">No assignments</p>
            <Link to="/lecturer/assignments/create" className="btn btn-primary btn-sm" style={{ marginTop: "0.75rem", display: "inline-flex" }}>Create assignment</Link>
          </div></div>
        ) : (
          <div className="card">
            <table className="data-table">
              <thead><tr><th>Assignment</th><th style={{ width: "160px" }}>Deadline</th><th style={{ width: "110px", textAlign: "center" }}>Submissions</th><th style={{ width: "70px" }}></th></tr></thead>
              <tbody>
                {module.assignments.map(a => {
                  const past = new Date(a.deadline) < new Date();
                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 500, color: "var(--color-text)" }}>{a.title}</td>
                      <td>
                        <p style={{ fontSize: "0.8125rem", color: past ? "var(--color-text-3)" : "var(--color-text-2)" }}>{new Date(a.deadline).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>
                        {past ? <span className="badge badge-gray">Closed</span> : <span className="badge badge-yellow">Open</span>}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 600 }}>{a._count.submissions}</td>
                      <td><Link to={`/lecturer/assignments/${a.id}`} className="btn btn-secondary btn-sm">View</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Resources */}
      {tab === "resources" && (
        module.resources.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-icon">📂</div><p className="empty-title">No resources</p>
            <Link to="/lecturer/resources" className="btn btn-primary btn-sm" style={{ marginTop: "0.75rem", display: "inline-flex" }}>Upload resources</Link>
          </div></div>
        ) : (
          <div className="card">
            <table className="data-table">
              <thead><tr><th>Title</th><th>File name</th><th style={{ width: "130px" }}>Uploaded</th></tr></thead>
              <tbody>
                {module.resources.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500, color: "var(--color-text)" }}>{r.title}</td>
                    <td style={{ color: "var(--color-text-3)" }}>{r.fileName}</td>
                    <td style={{ color: "var(--color-text-3)", fontSize: "0.8125rem" }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </AppShell>
  );
}
