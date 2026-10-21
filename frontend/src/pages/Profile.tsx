import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";

interface Module { id: number; code: string; name: string; credits: number; }
interface ProfileData { id: number; name: string; email: string; role: string; createdAt: string; }
interface DashboardData { profile: ProfileData; enrolledModules: Module[]; }

export default function Profile() {
  const { user, login, token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState("");
  const [nameError, setNameError] = useState("");
  const [showPwForm, setShowPwForm] = useState(false);
  const [curPw, setCurPw] = useState(""); const [newPw, setNewPw] = useState(""); const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false); const [pwSuccess, setPwSuccess] = useState(""); const [pwError, setPwError] = useState("");

  useEffect(() => {
    api.get("/dashboard").then(r => { setData(r.data); setNameInput(r.data.profile.name); }).catch(e => setError(e.response?.data?.message || "Failed to load")).finally(() => setLoading(false));
  }, []);

  async function saveName() {
    if (!nameInput.trim()) { setNameError("Name cannot be empty."); return; }
    try {
      setNameLoading(true); setNameError(""); setNameSuccess("");
      const r = await api.put("/users/me", { name: nameInput.trim() });
      setData(prev => prev ? { ...prev, profile: { ...prev.profile, name: r.data.user.name } } : prev);
      if (token && user) login(token, { ...user, name: r.data.user.name });
      setNameSuccess("Name updated."); setEditingName(false);
      setTimeout(() => setNameSuccess(""), 3000);
    } catch (err: any) { setNameError(err.response?.data?.message || "Failed to update"); }
    finally { setNameLoading(false); }
  }

  async function changePw(e: React.FormEvent) {
    e.preventDefault(); setPwError(""); setPwSuccess("");
    if (!curPw || !newPw || !confirmPw) { setPwError("All fields required."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords don't match."); return; }
    if (newPw.length < 8) { setPwError("Password must be 8+ characters."); return; }
    try {
      setPwLoading(true);
      await api.put("/users/change-password", { currentPassword: curPw, newPassword: newPw });
      setPwSuccess("Password changed."); setCurPw(""); setNewPw(""); setConfirmPw(""); setShowPwForm(false);
    } catch (err: any) { setPwError(err.response?.data?.message || "Failed to change password"); }
    finally { setPwLoading(false); }
  }

  if (loading) return <AppShell><div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div></AppShell>;
  if (error || !data) return <AppShell><div className="alert alert-danger">{error || "Failed to load"}</div></AppShell>;

  const roleBadge = data.profile.role === "ADMIN" ? "badge-violet" : data.profile.role === "LECTURER" ? "badge-indigo" : "badge-blue";

  return (
    <AppShell>
      <PageHeader title="Profile" description="Manage your personal details and account settings." />

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "1.25rem", alignItems: "start" }}>

        {/* Left card */}
        <div className="card" style={{ textAlign: "center" }}>
          <div className="card-body">
            <div style={{ width: "4rem", height: "4rem", borderRadius: "9999px", background: "var(--color-student-light)", border: `2px solid var(--color-student-border)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 700, color: "var(--color-student)", margin: "0 auto 1rem" }}>
              {data.profile.name.charAt(0).toUpperCase()}
            </div>
            <p style={{ fontWeight: 700, color: "var(--color-text)" }}>{data.profile.name}</p>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", marginTop: "0.25rem" }}>{data.profile.email}</p>
            <div style={{ marginTop: "0.75rem" }}><span className={`badge ${roleBadge}`}>{data.profile.role}</span></div>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-4)", marginTop: "0.75rem" }}>
              Joined {new Date(data.profile.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
            </p>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Name */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Account Information</h2>
              {!editingName && <button className="btn btn-secondary btn-sm" onClick={() => { setEditingName(true); setNameError(""); }}>Edit name</button>}
            </div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-3)" }}>Full Name</p>
                  {editingName ? (
                    <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <input className="form-input" value={nameInput} onChange={e => setNameInput(e.target.value)} autoFocus />
                      {nameError && <p className="form-error">{nameError}</p>}
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn btn-primary btn-sm" disabled={nameLoading} onClick={saveName}>{nameLoading ? "Saving…" : "Save"}</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditingName(false); setNameError(""); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p style={{ marginTop: "0.375rem", fontWeight: 500, color: "var(--color-text)" }}>{data.profile.name}</p>
                  )}
                  {nameSuccess && <p style={{ fontSize: "0.8125rem", color: "var(--color-success)", marginTop: "0.375rem" }}>✓ {nameSuccess}</p>}
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-3)" }}>Email</p>
                  <p style={{ marginTop: "0.375rem", fontWeight: 500, color: "var(--color-text)" }}>{data.profile.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Password</h2>
              {!showPwForm && <button className="btn btn-secondary btn-sm" onClick={() => setShowPwForm(true)}>Change password</button>}
            </div>
            <div className="card-body">
              {pwSuccess && !showPwForm && <div className="alert alert-success">✓ {pwSuccess}</div>}
              {!showPwForm && !pwSuccess && <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)" }}>Your password was last updated on account creation.</p>}
              {showPwForm && (
                <form onSubmit={changePw} style={{ maxWidth: "360px", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  <div><label className="form-label">Current password</label><input type="password" className="form-input" value={curPw} onChange={e => setCurPw(e.target.value)} autoComplete="current-password" /></div>
                  <div><label className="form-label">New password</label><input type="password" className="form-input" value={newPw} onChange={e => setNewPw(e.target.value)} autoComplete="new-password" /></div>
                  <div><label className="form-label">Confirm new password</label><input type="password" className="form-input" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} autoComplete="new-password" /></div>
                  {pwError && <p className="form-error">{pwError}</p>}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={pwLoading}>{pwLoading ? "Saving…" : "Update password"}</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setShowPwForm(false); setPwError(""); }}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Enrolled modules */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Enrolled Modules</h2>
              <span className="badge badge-gray">{data.enrolledModules.length}</span>
            </div>
            {data.enrolledModules.length === 0 ? (
              <div className="empty-state">
                <p className="empty-title">Not enrolled in any modules</p>
                <Link to="/modules" className="btn btn-primary btn-sm" style={{ marginTop: "0.75rem", display: "inline-flex" }}>Browse modules</Link>
              </div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Code</th><th>Module</th><th style={{ width: "80px", textAlign: "center" }}>Credits</th></tr></thead>
                <tbody>
                  {data.enrolledModules.map(m => (
                    <tr key={m.id}>
                      <td><Link to={`/modules/${m.id}`} style={{ fontWeight: 600, color: "var(--color-student)", textDecoration: "none" }}>{m.code}</Link></td>
                      <td style={{ color: "var(--color-text-2)" }}>{m.name}</td>
                      <td style={{ textAlign: "center" }}><span className="badge badge-gray">{m.credits}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </AppShell>
  );
}
