import { useEffect, useState } from "react";
import { api } from "../services/api";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";

interface Student { id: number; name: string; email: string; }
interface Module { id: number; code: string; name: string; }
interface Enrollment { id: number; enrolledAt: string; student: Student; module: Module; }

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false); const [selStudent, setSelStudent] = useState(""); const [selModule, setSelModule] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false); const [enrollError, setEnrollError] = useState("");
  const [removeModal, setRemoveModal] = useState<Enrollment | null>(null); const [removeLoading, setRemoveLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/admin/enrollments"), api.get("/admin/students"), api.get("/admin/modules")]).then(([e, s, m]) => { setEnrollments(e.data.enrollments); setStudents(s.data.students); setModules(m.data.modules); }).catch(e => setError(e.response?.data?.message || "Failed to load")).finally(() => setLoading(false));
  }, []);

  function flash(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault(); setEnrollError("");
    if (!selStudent || !selModule) { setEnrollError("Select both a student and a module."); return; }
    try {
      setEnrollLoading(true);
      const res = await api.post("/admin/enrollments", { studentId: Number(selStudent), moduleId: Number(selModule) });
      setEnrollments(prev => [res.data.enrollment, ...prev]);
      flash(`${res.data.enrollment.student.name} enrolled in ${res.data.enrollment.module.code}.`);
      setShowForm(false); setSelStudent(""); setSelModule("");
    } catch (err: any) { setEnrollError(err.response?.data?.message || "Failed to enrol"); }
    finally { setEnrollLoading(false); }
  }

  async function handleRemove() {
    if (!removeModal) return;
    try {
      setRemoveLoading(true);
      await api.delete(`/admin/enrollments/${removeModal.id}`);
      setEnrollments(prev => prev.filter(e => e.id !== removeModal.id));
      flash(`Enrollment removed for ${removeModal.student.name}.`); setRemoveModal(null);
    } catch (err: any) { setError(err.response?.data?.message || "Failed to remove"); setRemoveModal(null); }
    finally { setRemoveLoading(false); }
  }

  const filtered = enrollments.filter(e => e.student.name.toLowerCase().includes(search.toLowerCase()) || e.student.email.toLowerCase().includes(search.toLowerCase()) || e.module.code.toLowerCase().includes(search.toLowerCase()) || e.module.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell>
      <PageHeader
        title="Enrollments"
        description="Register students into modules and manage existing enrollments."
        action={<button className="btn btn-primary" onClick={() => { setShowForm(p => !p); setEnrollError(""); }}>{showForm ? "Cancel" : "+ Enrol Student"}</button>}
      />

      {showForm && (
        <div className="card" style={{ marginBottom: "1.5rem", borderColor: "var(--color-admin-border)" }}>
          <div className="card-header"><h2 className="card-title">Enrol a Student</h2></div>
          <div className="card-body">
            <form onSubmit={handleEnroll} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-grid form-grid-2">
                <div><label className="form-label">Student *</label>
                  <select className="form-select form-input" value={selStudent} onChange={e => setSelStudent(e.target.value)}>
                    <option value="">— Select a student —</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                  </select>
                </div>
                <div><label className="form-label">Module *</label>
                  <select className="form-select form-input" value={selModule} onChange={e => setSelModule(e.target.value)}>
                    <option value="">— Select a module —</option>
                    {modules.map(m => <option key={m.id} value={m.id}>{m.code} — {m.name}</option>)}
                  </select>
                </div>
              </div>
              {enrollError && <p className="form-error">{enrollError}</p>}
              <div style={{ display: "flex", gap: "0.625rem" }}>
                <button type="submit" disabled={enrollLoading} className="btn btn-primary">{enrollLoading ? "Enrolling…" : "Enrol Student"}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {success && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>✓ {success}</div>}
      {error && <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>{error}</div>}

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", alignItems: "center" }}>
        <input className="form-input" type="text" placeholder="Search student or module…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: "280px" }} />
        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)" }}>{filtered.length} enrollments</p>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><p className="empty-title">No enrollments found</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Student</th><th>Module</th><th style={{ width: "130px" }}>Enrolled</th><th style={{ width: "80px" }}></th></tr></thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td><p style={{ fontWeight: 500, color: "var(--color-text)" }}>{e.student.name}</p><p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>{e.student.email}</p></td>
                  <td><span className="badge badge-indigo">{e.module.code}</span><span style={{ fontSize: "0.875rem", color: "var(--color-text-2)", marginLeft: "0.5rem" }}>{e.module.name}</span></td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--color-text-3)" }}>{new Date(e.enrolledAt).toLocaleDateString()}</td>
                  <td><button className="btn btn-sm" style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", border: "1px solid var(--color-danger-border)" }} onClick={() => setRemoveModal(e)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {removeModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 style={{ fontWeight: 700, color: "var(--color-text)" }}>Remove enrollment?</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)", marginTop: "0.375rem" }}>
              Remove <strong>{removeModal.student.name}</strong> from <strong>{removeModal.module.code} — {removeModal.module.name}</strong>?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.625rem", marginTop: "1.5rem" }}>
              <button className="btn btn-secondary" disabled={removeLoading} onClick={() => setRemoveModal(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={removeLoading} onClick={handleRemove}>{removeLoading ? "Removing…" : "Remove"}</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
