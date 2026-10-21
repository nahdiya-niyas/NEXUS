import { useEffect, useState } from "react";
import { api } from "../services/api";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";

interface Module { id: number; code: string; name: string; }
interface Resource { id: number; title: string; fileName: string; filePath: string; moduleId: number; createdAt: string; }

export default function LecturerResources() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/lecturer/modules").then(r => {
      const mods = r.data.modules || [];
      setModules(mods);
      if (mods.length > 0) setSelectedModule(mods[0].id);
    }).catch(e => setError(e.response?.data?.message || "Failed to load modules")).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedModule) { setResources([]); return; }
    setResourceLoading(true);
    api.get(`/resources/module/${selectedModule}`).then(r => setResources(r.data.resources || [])).catch(e => setError(e.response?.data?.message || "Failed to load resources")).finally(() => setResourceLoading(false));
  }, [selectedModule]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    if (!selectedModule) { setError("Select a module."); return; }
    if (!title.trim()) { setError("Enter a resource title."); return; }
    if (!file) { setError("Select a file."); return; }
    try {
      setResourceLoading(true);
      const form = new FormData(); form.append("title", title.trim()); form.append("file", file);
      await api.post(`/resources/module/${selectedModule}`, form, { headers: { "Content-Type": "multipart/form-data" } });
      setTitle(""); setFile(null);
      const inp = document.getElementById("res-file") as HTMLInputElement | null; if (inp) inp.value = "";
      const r = await api.get(`/resources/module/${selectedModule}`); setResources(r.data.resources || []);
      setMessage("Resource uploaded successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) { setError(err.response?.data?.message || "Upload failed"); }
    finally { setResourceLoading(false); }
  }

  async function handleDelete(resourceId: number) {
    if (!window.confirm("Delete this resource?")) return;
    try {
      setResourceLoading(true);
      await api.delete(`/resources/${resourceId}`);
      setResources(prev => prev.filter(r => r.id !== resourceId));
      setMessage("Resource deleted."); setTimeout(() => setMessage(""), 3000);
    } catch (err: any) { setError(err.response?.data?.message || "Delete failed"); }
    finally { setResourceLoading(false); }
  }

  const fileUrl = (p: string) => p.startsWith("http") ? p : `http://localhost:3001${p}`;

  if (loading) return <AppShell><div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div></AppShell>;

  return (
    <AppShell>
      <PageHeader title="Resources" description="Upload and manage learning materials for your modules." />

      {message && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>{message}</div>}
      {error && <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Module selector + upload form */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-header"><h2 className="card-title">Upload Resource</h2></div>
        <div className="card-body">
          <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-grid form-grid-2">
              <div>
                <label className="form-label">Module</label>
                <select className="form-select form-input" value={selectedModule ?? ""} onChange={e => setSelectedModule(e.target.value ? Number(e.target.value) : null)}>
                  {modules.length === 0 && <option value="">No modules available</option>}
                  {modules.map(m => <option key={m.id} value={m.id}>{m.code} — {m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Resource title <span style={{ color: "var(--color-danger)" }}>*</span></label>
                <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Week 01 Lecture Notes" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">File <span style={{ color: "var(--color-danger)" }}>*</span></label>
                <input id="res-file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" onChange={e => setFile(e.target.files?.[0] || null)} style={{ fontSize: "0.875rem", color: "var(--color-text-2)" }} />
              </div>
            </div>
            <div>
              <button type="submit" disabled={resourceLoading} className="btn btn-primary">
                {resourceLoading ? "Uploading…" : "Upload Resource"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Resource list */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Module Resources</h2>
          <span className="badge badge-gray">{resources.length}</span>
        </div>
        {resourceLoading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div>
        ) : resources.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📂</div><p className="empty-title">No resources yet</p><p className="empty-description">Upload your first resource using the form above.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Title</th><th>File name</th><th style={{ width: "140px" }}>Uploaded</th><th style={{ width: "120px" }}></th></tr></thead>
            <tbody>
              {resources.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500, color: "var(--color-text)" }}>{r.title}</td>
                  <td style={{ color: "var(--color-text-3)", fontSize: "0.8125rem" }}>{r.fileName}</td>
                  <td style={{ color: "var(--color-text-3)", fontSize: "0.8125rem" }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <a href={fileUrl(r.filePath)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Open</a>
                      <button className="btn btn-sm" style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", border: "1px solid var(--color-danger-border)" }} disabled={resourceLoading} onClick={() => handleDelete(r.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
