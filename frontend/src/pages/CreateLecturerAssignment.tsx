import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";

interface Module { id: number; code: string; name: string; }

export default function CreateLecturerAssignment() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingModules, setLoadingModules] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/lecturer/modules").then(r => setModules(r.data.modules || [])).catch(() => setError("Failed to load modules.")).finally(() => setLoadingModules(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!title || !moduleId || !deadline) { setError("Title, module, and deadline are required."); return; }
    if (!file) { setError("Upload the assignment document."); return; }
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) { setError("Only PDF, DOC, DOCX files are allowed."); return; }
    if (file.size > 20 * 1024 * 1024) { setError("File must be 20 MB or smaller."); return; }
    try {
      setLoading(true);
      const form = new FormData();
      form.append("title", title); form.append("description", description); form.append("deadline", deadline); form.append("moduleId", moduleId); form.append("file", file);
      await api.post("/lecturer/assignments", form, { headers: { "Content-Type": "multipart/form-data" } });
      navigate("/lecturer/assignments");
    } catch (err: any) { setError(err?.response?.data?.message || "Failed to create assignment."); }
    finally { setLoading(false); }
  }

  return (
    <AppShell>
      <PageHeader
        title="Create Assignment"
        description="Post a new assignment for your students."
        backButton={
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back to Assignments</button>
        }
      />

      <div style={{ maxWidth: "720px" }}>
        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-danger" style={{ marginBottom: "1.25rem" }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              <div className="form-grid form-grid-2">
                <div>
                  <label className="form-label">Assignment title <span style={{ color: "var(--color-danger)" }}>*</span></label>
                  <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Linux Administration Lab 02" />
                </div>
                <div>
                  <label className="form-label">Module <span style={{ color: "var(--color-danger)" }}>*</span></label>
                  <select className="form-select form-input" value={moduleId} onChange={e => setModuleId(e.target.value)} disabled={loadingModules}>
                    <option value="">{loadingModules ? "Loading modules…" : "Select a module"}</option>
                    {modules.map(m => <option key={m.id} value={m.id}>{m.code} — {m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Deadline <span style={{ color: "var(--color-danger)" }}>*</span></label>
                  <input type="datetime-local" className="form-input" value={deadline} onChange={e => setDeadline(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Assignment document <span style={{ color: "var(--color-danger)" }}>*</span></label>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files?.[0] || null)} style={{ fontSize: "0.875rem", color: "var(--color-text-2)" }} />
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-4)", marginTop: "0.375rem" }}>PDF, DOC, DOCX — max 20 MB</p>
                </div>
              </div>

              <div>
                <label className="form-label">Instructions</label>
                <textarea className="form-textarea form-input" rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what students need to do…" />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? "Creating…" : "Create Assignment"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
