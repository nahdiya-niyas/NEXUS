import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";

type Role = "STUDENT" | "LECTURER" | "ADMIN";

interface User { id: number; name: string; email: string; role: Role; createdAt: string; _count: { enrollments: number; submissions: number; }; }

const roleColors: Record<string, string> = { ADMIN: "badge-violet", LECTURER: "badge-indigo", STUDENT: "badge-blue" };

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">((searchParams.get("role") as Role) || "ALL");
  const [success, setSuccess] = useState("");

  // Add user form
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState(""); const [addEmail, setAddEmail] = useState(""); const [addPassword, setAddPassword] = useState(""); const [addRole, setAddRole] = useState<Role>("STUDENT");
  const [addLoading, setAddLoading] = useState(false); const [addError, setAddError] = useState("");

  // Role modal
  const [roleModal, setRoleModal] = useState<User | null>(null); const [newRole, setNewRole] = useState<Role>("STUDENT"); const [roleLoading, setRoleLoading] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<User | null>(null); const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { api.get("/admin/users").then(r => setUsers(r.data.users)).catch(e => setError(e.response?.data?.message || "Failed to load")).finally(() => setLoading(false)); }, []);

  function flash(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setAddError("");
    if (!addName.trim() || !addEmail.trim() || !addPassword) { setAddError("All fields are required."); return; }
    try {
      setAddLoading(true);
      const res = await api.post("/admin/users", { name: addName.trim(), email: addEmail.trim(), password: addPassword, role: addRole });
      const newUser: User = { ...res.data.user, _count: { enrollments: 0, submissions: 0 } };
      setUsers(prev => [newUser, ...prev]);
      flash(`${newUser.name} added as ${addRole}.`);
      setShowAdd(false); setAddName(""); setAddEmail(""); setAddPassword(""); setAddRole("STUDENT");
    } catch (err: any) { setAddError(err.response?.data?.message || "Failed to add user"); }
    finally { setAddLoading(false); }
  }

  async function handleRoleChange() {
    if (!roleModal) return;
    try {
      setRoleLoading(true);
      await api.patch(`/admin/users/${roleModal.id}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === roleModal.id ? { ...u, role: newRole } : u));
      flash(`${roleModal.name}'s role updated to ${newRole}.`); setRoleModal(null);
    } catch (err: any) { setError(err.response?.data?.message || "Failed to update role"); }
    finally { setRoleLoading(false); }
  }

  async function handleDelete() {
    if (!deleteModal) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/admin/users/${deleteModal.id}`);
      setUsers(prev => prev.filter(u => u.id !== deleteModal.id));
      flash(`${deleteModal.name} deleted.`); setDeleteModal(null);
    } catch (err: any) { setError(err.response?.data?.message || "Failed to delete"); }
    finally { setDeleteLoading(false); }
  }

  const filtered = users.filter(u => {
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <AppShell>
      <PageHeader
        title="Users"
        description="Manage all registered users and their roles."
        action={<button className="btn btn-primary" onClick={() => { setShowAdd(p => !p); setAddError(""); }}>{showAdd ? "Cancel" : "+ Add User"}</button>}
      />

      {/* Add form */}
      {showAdd && (
        <div className="card" style={{ marginBottom: "1.5rem", borderColor: "var(--color-admin-border)" }}>
          <div className="card-header"><h2 className="card-title">Add New User</h2></div>
          <div className="card-body">
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-grid form-grid-2">
                <div><label className="form-label">Full name *</label><input className="form-input" type="text" value={addName} onChange={e => setAddName(e.target.value)} placeholder="Full name" /></div>
                <div><label className="form-label">Email *</label><input className="form-input" type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)} placeholder="email@example.com" /></div>
                <div><label className="form-label">Password *</label><input className="form-input" type="password" value={addPassword} onChange={e => setAddPassword(e.target.value)} placeholder="Min 8 characters" /></div>
                <div><label className="form-label">Role *</label>
                  <select className="form-select form-input" value={addRole} onChange={e => setAddRole(e.target.value as Role)}>
                    <option value="STUDENT">STUDENT</option>
                    <option value="LECTURER">LECTURER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
              {addError && <p className="form-error">{addError}</p>}
              <div style={{ display: "flex", gap: "0.625rem" }}>
                <button type="submit" disabled={addLoading} className="btn btn-primary">{addLoading ? "Adding…" : "Add User"}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {success && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>✓ {success}</div>}
      {error && <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>{error}</div>}

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <input className="form-input" type="text" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: "260px" }} />
        <select className="form-select form-input" value={roleFilter} style={{ width: "140px" }}
          onChange={e => { const v = e.target.value as Role | "ALL"; setRoleFilter(v); if (v !== "ALL") setSearchParams({ role: v }); else setSearchParams({}); }}>
          <option value="ALL">All roles</option>
          <option value="STUDENT">Students</option>
          <option value="LECTURER">Lecturers</option>
          <option value="ADMIN">Admins</option>
        </select>
        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)" }}>{filtered.length} of {users.length} users</p>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><p className="empty-title">No users found</p></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th style={{ width: "100px", textAlign: "center" }}>Role</th>
                <th style={{ width: "120px", textAlign: "center" }}>Modules</th>
                <th style={{ width: "120px", textAlign: "center" }}>Submissions</th>
                <th style={{ width: "110px" }}>Joined</th>
                <th style={{ width: "160px" }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <div style={{ width: "2rem", height: "2rem", borderRadius: "9999px", background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-2)", flexShrink: 0 }}>{u.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          <p style={{ fontWeight: 500, color: "var(--color-text)" }}>{u.name}</p>
                          {u.id === me?.id && <span className="badge badge-gray">You</span>}
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}><span className={`badge ${roleColors[u.role]}`}>{u.role}</span></td>
                  <td style={{ textAlign: "center", color: "var(--color-text-2)" }}>{u._count.enrollments}</td>
                  <td style={{ textAlign: "center", color: "var(--color-text-2)" }}>{u._count.submissions}</td>
                  <td style={{ fontSize: "0.8125rem", color: "var(--color-text-3)" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u.id !== me?.id && (
                      <div style={{ display: "flex", gap: "0.375rem" }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setRoleModal(u); setNewRole(u.role); }}>Role</button>
                        <button className="btn btn-sm" style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", border: "1px solid var(--color-danger-border)" }} onClick={() => setDeleteModal(u)}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Role modal */}
      {roleModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 style={{ fontWeight: 700, color: "var(--color-text)" }}>Change Role</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)", marginTop: "0.375rem" }}>Update role for <strong>{roleModal.name}</strong></p>
            <select className="form-select form-input" value={newRole} onChange={e => setNewRole(e.target.value as Role)} style={{ marginTop: "1rem" }}>
              <option value="STUDENT">STUDENT</option>
              <option value="LECTURER">LECTURER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.625rem", marginTop: "1.5rem" }}>
              <button className="btn btn-secondary" onClick={() => setRoleModal(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={roleLoading || newRole === roleModal.role} onClick={handleRoleChange}>{roleLoading ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 style={{ fontWeight: 700, color: "var(--color-text)" }}>Delete user?</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)", marginTop: "0.375rem" }}>This will permanently delete <strong>{deleteModal.name}</strong> and all their data.</p>
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
