import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";

export default function AdminSettings() {
  const { user, login, token } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [profileLoading, setProfileLoading] = useState(false); const [profileSuccess, setProfileSuccess] = useState(""); const [profileError, setProfileError] = useState("");
  const [curPw, setCurPw] = useState(""); const [newPw, setNewPw] = useState(""); const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false); const [pwSuccess, setPwSuccess] = useState(""); const [pwError, setPwError] = useState("");

  async function saveName(e: React.FormEvent) {
    e.preventDefault(); setProfileError(""); setProfileSuccess("");
    if (!name.trim()) { setProfileError("Name cannot be empty."); return; }
    try {
      setProfileLoading(true);
      const res = await api.put("/users/me", { name: name.trim() });
      if (token && user) login(token, { ...user, name: res.data.user.name });
      setProfileSuccess("Name updated."); setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err: any) { setProfileError(err.response?.data?.message || "Failed to update"); }
    finally { setProfileLoading(false); }
  }

  async function changePw(e: React.FormEvent) {
    e.preventDefault(); setPwError(""); setPwSuccess("");
    if (!curPw || !newPw || !confirmPw) { setPwError("All fields required."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords don't match."); return; }
    if (newPw.length < 8) { setPwError("Password must be 8+ characters."); return; }
    try {
      setPwLoading(true);
      await api.put("/users/change-password", { currentPassword: curPw, newPassword: newPw });
      setPwSuccess("Password changed."); setCurPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setPwSuccess(""), 3000);
    } catch (err: any) { setPwError(err.response?.data?.message || "Failed to change password"); }
    finally { setPwLoading(false); }
  }

  return (
    <AppShell>
      <PageHeader title="Settings" description="Manage your admin account." />

      <div style={{ maxWidth: "580px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Profile card */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Profile</h2></div>
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "9999px", background: "var(--color-admin-light)", border: `2px solid var(--color-admin-border)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", fontWeight: 700, color: "var(--color-admin)", flexShrink: 0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: "var(--color-text)" }}>{user?.name}</p>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)" }}>{user?.email}</p>
              <span className="badge badge-violet" style={{ marginTop: "0.25rem" }}>ADMIN</span>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--color-border)", padding: "1.25rem" }}>
            <form onSubmit={saveName} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div><label className="form-label">Display name</label><input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} /></div>
              {profileError && <p className="form-error">{profileError}</p>}
              {profileSuccess && <p style={{ fontSize: "0.8125rem", color: "var(--color-success)" }}>✓ {profileSuccess}</p>}
              <button type="submit" disabled={profileLoading} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>{profileLoading ? "Saving…" : "Save name"}</button>
            </form>
          </div>
        </div>

        {/* Password card */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Change Password</h2></div>
          <div className="card-body">
            <form onSubmit={changePw} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div><label className="form-label">Current password</label><input className="form-input" type="password" value={curPw} onChange={e => setCurPw(e.target.value)} autoComplete="current-password" /></div>
              <div><label className="form-label">New password</label><input className="form-input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} autoComplete="new-password" /></div>
              <div><label className="form-label">Confirm new password</label><input className="form-input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} autoComplete="new-password" /></div>
              {pwError && <p className="form-error">{pwError}</p>}
              {pwSuccess && <p style={{ fontSize: "0.8125rem", color: "var(--color-success)" }}>✓ {pwSuccess}</p>}
              <button type="submit" disabled={pwLoading} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>{pwLoading ? "Saving…" : "Update password"}</button>
            </form>
          </div>
        </div>

        {/* Platform info */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Platform Info</h2></div>
          <table className="data-table">
            <tbody>
              {[["Platform", "NEXUS — University Academic Platform"], ["Version", "1.0.0"], ["Your role", "ADMINISTRATOR"], ["Email", user?.email || ""]].map(([k, v]) => (
                <tr key={k}><td style={{ width: "150px", fontWeight: 600, color: "var(--color-text-3)", fontSize: "0.8125rem" }}>{k}</td><td style={{ color: "var(--color-text-2)" }}>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AppShell>
  );
}
