import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import AppShell from "../components/AppShell";

interface Lecturer { id: number; name: string; email: string; }
interface Assignment { id: number; title: string; description?: string | null; deadline: string; }
interface Resource { id: number; title: string; fileName: string; filePath: string; createdAt: string; }
interface Module {
  id: number; code: string; name: string; description?: string | null; credits: number;
  lecturer?: Lecturer | null; assignments: Assignment[];
}

export default function ModuleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"resources" | "assignments">("resources");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/modules/${id}`);
        setModule(res.data.module);
        setEnrolled(res.data.enrolled);
      } catch (err: any) { setError(err.response?.data?.message || "Failed to load module"); }
      finally { setLoading(false); }
    })();
  }, [id]);

  useEffect(() => {
    if (!enrolled || !id) { setResources([]); return; }
    api.get(`/resources/module/${id}`).then(r => setResources(r.data.resources || [])).catch(() => {});
  }, [enrolled, id]);

  const fileUrl = (p: string) => p.startsWith("http") ? p : `http://localhost:3001${p}`;

  if (loading) return <AppShell><div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading module…</div></AppShell>;
  if (error || !module) return (
    <AppShell>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: "1rem" }} onClick={() => navigate(-1)}>← Back</button>
      <div className="alert alert-danger">{error || "Module not found"}</div>
    </AppShell>
  );

  return (
    <AppShell>
      {/* Back */}
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: "1rem" }} onClick={() => navigate(-1)}>← Back to Modules</button>

      {/* Header */}
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <div className="card-body" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-student)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{module.code}</p>
              <h1 className="page-title" style={{ marginTop: "0.25rem" }}>{module.name}</h1>
              {module.description && <p className="page-description" style={{ maxWidth: "600px" }}>{module.description}</p>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <span className="badge badge-gray">{module.credits} credits</span>
              {module.lecturer && <span className="badge badge-blue">👤 {module.lecturer.name}</span>}
              {enrolled ? <span className="badge badge-green">Enrolled</span> : <span className="badge badge-yellow">Not enrolled</span>}
            </div>
          </div>
        </div>
      </div>

      {!enrolled ? (
        <div className="alert alert-warning">
          You're not enrolled in this module. Enrol to access resources and assignments.
          <Link to="/modules" style={{ marginLeft: "0.5rem", fontWeight: 600, color: "var(--color-warning)" }}>Go to Modules →</Link>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.125rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-lg)", padding: "0.25rem", marginBottom: "1.25rem", width: "fit-content" }}>
            {(["resources", "assignments"] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  padding: "0.375rem 0.875rem", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer",
                  fontSize: "0.875rem", fontWeight: 600, transition: "background 120ms, color 120ms",
                  background: tab === t ? "white" : "transparent",
                  color: tab === t ? "var(--color-text)" : "var(--color-text-3)",
                  boxShadow: tab === t ? "var(--shadow-sm)" : "none",
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === "resources" && (
            resources.length === 0 ? (
              <div className="card"><div className="empty-state"><div className="empty-icon">📂</div><p className="empty-title">No resources yet</p><p className="empty-description">Your lecturer hasn't uploaded any files for this module yet.</p></div></div>
            ) : (
              <div className="card">
                {resources.map(r => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--color-border)", gap: "1rem" }}>
                    <div>
                      <p style={{ fontWeight: 500, color: "var(--color-text)" }}>{r.title}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>{r.fileName} · Uploaded {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <a href={fileUrl(r.filePath)} target="_blank" rel="noreferrer" download className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>Download</a>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "assignments" && (
            module.assignments.length === 0 ? (
              <div className="card"><div className="empty-state"><div className="empty-icon">📝</div><p className="empty-title">No assignments</p><p className="empty-description">No assignments have been posted for this module yet.</p></div></div>
            ) : (
              <div className="card">
                <table className="data-table">
                  <thead><tr><th>Assignment</th><th>Description</th><th style={{ width: "160px" }}>Deadline</th><th style={{ width: "80px" }}></th></tr></thead>
                  <tbody>
                    {module.assignments.sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime()).map(a => {
                      const past = new Date(a.deadline) < new Date();
                      return (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 500, color: "var(--color-text)" }}>{a.title}</td>
                          <td style={{ color: "var(--color-text-3)" }}>{a.description || "—"}</td>
                          <td>
                            <p style={{ fontSize: "0.8125rem", color: past ? "var(--color-text-3)" : "var(--color-warning)" }}>
                              {new Date(a.deadline).toLocaleDateString(undefined, { dateStyle: "medium" })}
                            </p>
                            {past ? <span className="badge badge-gray">Past</span> : <span className="badge badge-yellow">Upcoming</span>}
                          </td>
                          <td><Link to={`/assignments/${a.id}`} className="btn btn-secondary btn-sm">View</Link></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}
    </AppShell>
  );
}
