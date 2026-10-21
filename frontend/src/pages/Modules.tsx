import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";

interface Module { id: number; code: string; name: string; description?: string | null; credits: number; }

export default function Modules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<number[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [dropModal, setDropModal] = useState<Module | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    try {
      setLoading(true); setError("");
      const [mRes, eRes] = await Promise.all([api.get("/modules"), api.get("/enrollments/my")]);
      setModules(mRes.data.modules || []);
      setEnrolledIds((eRes.data.enrollments || []).map((e: any) => e.module.id));
    } catch (err: any) { setError(err.response?.data?.message || "Failed to load modules"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) { setError("Enter a module code."); return; }
    try {
      setEnrolling(true); setError(""); setMessage("");
      const res = await api.post("/enrollments", { code: code.trim().toUpperCase() });
      setMessage(res.data.message || "Enrolled successfully.");
      setCode("");
      await load();
    } catch (err: any) { setError(err.response?.data?.message || "Failed to enrol"); }
    finally { setEnrolling(false); }
  }

  async function confirmDrop() {
    if (!dropModal) return;
    try {
      setDropping(true); setError(""); setMessage("");
      await api.delete(`/enrollments/${dropModal.id}`);
      setMessage(`${dropModal.code} dropped.`);
      setEnrolledIds(prev => prev.filter(id => id !== dropModal.id));
      setDropModal(null);
    } catch (err: any) { setError(err.response?.data?.message || "Failed to drop module"); }
    finally { setDropping(false); }
  }

  const filtered = modules.filter(m =>
    m.code.toLowerCase().includes(search.toLowerCase()) ||
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <PageHeader title="Modules" description="Browse available modules and manage your enrolments." />

      {/* Enrol form */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-header"><h2 className="card-title">Enrol in a module</h2></div>
        <div className="card-body">
          <form onSubmit={handleEnroll} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Module code, e.g. N3462"
              className="form-input"
              style={{ flex: "1 1 200px" }}
            />
            <button type="submit" disabled={enrolling} className="btn btn-primary">
              {enrolling ? "Enrolling…" : "Enrol"}
            </button>
          </form>
          {message && <div className="alert alert-success" style={{ marginTop: "0.75rem" }}>{message}</div>}
          {error && <div className="alert alert-danger" style={{ marginTop: "0.75rem" }}>{error}</div>}
        </div>
      </div>

      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search modules…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input"
          style={{ maxWidth: "280px" }}
        />
        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)" }}>
          {filtered.length} module{filtered.length !== 1 ? "s" : ""}
          {enrolledIds.length > 0 && ` · ${enrolledIds.length} enrolled`}
        </p>
      </div>

      {loading ? (
        <div className="card"><div style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading modules…</div></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <p className="empty-title">No modules found</p>
            <p className="empty-description">Try a different search term.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Description</th>
                <th style={{ width: "80px", textAlign: "center" }}>Credits</th>
                <th style={{ width: "120px", textAlign: "center" }}>Status</th>
                <th style={{ width: "130px" }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const enrolled = enrolledIds.includes(m.id);
                return (
                  <tr key={m.id}>
                    <td>
                      <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--color-student)" }}>{m.code}</p>
                      <p style={{ fontWeight: 500, color: "var(--color-text)" }}>{m.name}</p>
                    </td>
                    <td style={{ color: "var(--color-text-3)", maxWidth: "300px" }}>
                      <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {m.description || "No description."}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className="badge badge-gray">{m.credits}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {enrolled
                        ? <span className="badge badge-green">Enrolled</span>
                        : <span className="badge badge-gray">Available</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Link to={`/modules/${m.id}`} className="btn btn-secondary btn-sm">View</Link>
                        {enrolled && (
                          <button type="button" className="btn btn-sm" style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", border: "1px solid var(--color-danger-border)" }} onClick={() => { setError(""); setMessage(""); setDropModal(m); }}>
                            Drop
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Drop modal */}
      {dropModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text)" }}>Drop module?</h3>
            <p style={{ color: "var(--color-text-3)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              You'll be unenrolled from <strong>{dropModal.code} — {dropModal.name}</strong>. This cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.625rem", marginTop: "1.5rem" }}>
              <button className="btn btn-secondary" disabled={dropping} onClick={() => setDropModal(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={dropping} onClick={confirmDrop}>{dropping ? "Dropping…" : "Drop module"}</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
