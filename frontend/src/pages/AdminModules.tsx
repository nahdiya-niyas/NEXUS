import { useEffect, useState } from "react";
import { api } from "../services/api";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";

interface Lecturer { id: number; name: string; email: string; }
interface Module { id: number; code: string; name: string; description: string | null; credits: number; createdAt: string; lecturer: Lecturer | null; _count: { enrollments: number; assignments: number; }; }

export default function AdminModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newCode, setNewCode] = useState(""); const [newName, setNewName] = useState(""); const [newDescription, setNewDescription] = useState(""); const [newCredits, setNewCredits] = useState("10"); const [newLecturerId, setNewLecturerId] = useState("");
  const [createLoading, setCreateLoading] = useState(false); const [createError, setCreateError] = useState("");
  const [deleteModal, setDeleteModal] = useState<Module | null>(null); const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/admin/modules"), api.get("/admin/lecturers")]).then(([m, l]) => { setModules(m.data.modules); setLecturers(l.data.lecturers); }).catch(e => setError(e.response?.data?.message || "Failed to load")).finally(() => setLoading(false));
  }, []);

  function flash(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setCreateError("");
    if (!newCode.trim() || !newName.trim() || !newCredits) { setCreateError("Code, name, and credits are required."); return; }
    try {
      setCreateLoading(true);
      const res = await api.post("/admin/modules", { code: newCode.trim(), name: newName.trim(), description: newDescription.trim() || undefined, credits: Number(newCredits), lecturerId: newLecturerId ? Number(newLecturerId) : undefined });
      const newMod: Module = { ...res.data.module, _count: { enrollments: 0, assignments: 0 } };
      setModules(prev => [newMod, ...prev]);
      flash(`Module "${newMod.code}" created.`); setShowForm(false); setNewCode(""); setNewName(""); setNewDescription(""); setNewCredits("10"); setNewLecturerId("");
    } catch (err: any) { setCreateError(err.response?.data?.message || "Failed to create module"); }
    finally { setCreateLoading(false); }
  }

  async function handleDelete() {
    if (!deleteModal) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/admin/modules/${deleteModal.id}`);
      setModules(prev => prev.filter(m => m.id !== deleteModal.id));
      flash(`Module "${deleteModal.code}" deleted.`); setDeleteModal(null);
    } catch (err: any) { setError(err.response?.data?.message || "Failed to delete"); setDeleteModal(null); }
    finally { setDeleteLoading(false); }
  }

  const filtered = modules.filter(m => m.code.toLowerCase().includes(search.toLowerCase()) || m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell>
      <PageHeader
        title="Modules"
        description="Create and manage all platform modules."
        action={<button className="btn btn-primary" onClick={() => { setShowForm(p => !p); setCreateError(""); }}>{showForm ? "Cancel" : "+ Create Module"}</button>}
      />

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ marginBottom: "1.5rem", borderColor: "var(--color-admin-border)" }}>
          <div className="card-header"><h2 className="card-title">New Module</h2></div>
          <div className="card-body">
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-grid form-grid-2">
                <div><label className="form-label">Module code *</label><input className="form-input" type="text" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} placeholder="e.g. CS101" /></div>
                <div><label className="form-label">Module name *</label><input className="form-input" type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Introduction to Computing" /></div>
                <div><label className="form-label">Credits *</label><input className="form-input" type="number" min="1" max="60" value={newCredits} onChange={e => setNewCredits(e.target.value)} /></div>
                <div><label className="form-label">Assign Lecturer</label>
                  <select className="form-select form-input" value={newLecturerId} onChange={e => setNewLecturerId(e.target.value)}>
                    <option value="">— No lecturer —</option>
                    {lecturers.map(l => <option key={l.id} value={l.id}>{l.name} ({l.email})</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea form-input" rows={3} value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Brief description…" />
                </div>
              </div>
              {createError && <p className="form-error">{createError}</p>}
              <div style={{ display: "flex", gap: "0.625rem" }}>
                <button type="submit" disabled={createLoading} className="btn btn-primary">{createLoading ? "Creating…" : "Create Module"}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {success && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>✓ {success}</div>}
      {error && <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Search */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", alignItems: "center" }}>
        <input className="form-input" type="text" placeholder="Search code or name…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: "260px" }} />
        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)" }}>{filtered.length} modules</p>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><p className="empty-title">No modules found</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Module</th><th>Description</th><th style={{ width: "80px", textAlign: "center" }}>Credits</th><th style={{ width: "100px" }}>Lecturer</th><th style={{ width: "90px", textAlign: "center" }}>Students</th><th style={{ width: "100px", textAlign: "center" }}>Assignments</th><th style={{ width: "70px" }}></th></tr></thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td><p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--color-lecturer)" }}>{m.code}</p><p style={{ fontWeight: 500, color: "var(--color-text)" }}>{m.name}</p></td>
                  <td style={{ color: "var(--color-text-3)", maxWidth: "200px" }}><span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.description || "—"}</span></td>
                  <td style={{ textAlign: "center" }}><span className="badge badge-gray">{m.credits}</span></td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--color-text-2)" }}>{m.lecturer ? m.lecturer.name : <span style={{ color: "var(--color-text-4)" }}>Unassigned</span>}</td>
                  <td style={{ textAlign: "center", fontWeight: 600 }}>{m._count.enrollments}</td>
                  <td style={{ textAlign: "center", fontWeight: 600 }}>{m._count.assignments}</td>
                  <td><button className="btn btn-sm" style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", border: "1px solid var(--color-danger-border)" }} onClick={() => setDeleteModal(m)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete modal */}
      {deleteModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 style={{ fontWeight: 700, color: "var(--color-text)" }}>Delete module?</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)", marginTop: "0.375rem" }}>
              <strong>{deleteModal.code} — {deleteModal.name}</strong> and all its assignments, resources, and enrollments will be permanently deleted.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.625rem", marginTop: "1.5rem" }}>
              <button className="btn btn-secondary" disabled={deleteLoading} onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={deleteLoading} onClick={handleDelete}>{deleteLoading ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
