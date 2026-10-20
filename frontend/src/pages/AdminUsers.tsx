import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AdminNavbar from "../components/AdminNavbar";

type Role = "STUDENT" | "LECTURER" | "ADMIN";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  _count: { enrollments: number; submissions: number };
}

function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">(
    (searchParams.get("role") as Role) || "ALL"
  );

  // Role change modal
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<Role>("STUDENT");
  const [roleLoading, setRoleLoading] = useState(false);

  // Delete modal
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  // Add user form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState<Role>("STUDENT");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange() {
    if (!roleModalUser) return;
    try {
      setRoleLoading(true);
      await api.patch(`/admin/users/${roleModalUser.id}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === roleModalUser.id ? { ...u, role: newRole } : u));
      setSuccessMessage(`${roleModalUser.name}'s role updated to ${newRole}`);
      setRoleModalUser(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update role");
    } finally {
      setRoleLoading(false);
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    if (!addName.trim() || !addEmail.trim() || !addPassword) {
      setAddError("All fields are required.");
      return;
    }
    try {
      setAddLoading(true);
      const res = await api.post("/admin/users", {
        name: addName.trim(),
        email: addEmail.trim(),
        password: addPassword,
        role: addRole,
      });
      setUsers((prev) => [res.data.user, ...prev]);
      setSuccessMessage(`${res.data.user.name} added as ${addRole}.`);
      setShowAddForm(false);
      setAddName(""); setAddEmail(""); setAddPassword(""); setAddRole("STUDENT");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setAddError(err.response?.data?.message || "Failed to add user");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDelete() {    if (!deleteModalUser) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/admin/users/${deleteModalUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteModalUser.id));
      setSuccessMessage(`${deleteModalUser.name} has been deleted`);
      setDeleteModalUser(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  }

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const roleColor = (role: string) => {
    if (role === "ADMIN") return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    if (role === "LECTURER") return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-violet-400">Admin Panel</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Users</h1>
            <p className="mt-2 text-slate-400">Manage all registered users and their roles.</p>
          </div>
          <button
            type="button"
            onClick={() => { setShowAddForm((p) => !p); setAddError(""); }}
            className="shrink-0 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            {showAddForm ? "Cancel" : "+ Add User"}
          </button>
        </div>

        {/* ADD USER FORM */}
        {showAddForm && (
          <form onSubmit={handleAddUser} className="mb-8 rounded-2xl border border-violet-500/20 bg-slate-900 p-6">
            <h2 className="mb-5 text-lg font-semibold text-white">Add New User</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Full Name *</label>
                <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. John Smith"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 placeholder:text-slate-600" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Email *</label>
                <input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="e.g. john@example.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 placeholder:text-slate-600" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Password *</label>
                <input type="password" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} placeholder="Min 8 characters"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 placeholder:text-slate-600" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Role *</label>
                <select value={addRole} onChange={(e) => setAddRole(e.target.value as Role)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500">
                  <option value="STUDENT">STUDENT</option>
                  <option value="LECTURER">LECTURER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
            {addError && <p className="mt-3 text-sm text-red-400">{addError}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800">
                Cancel
              </button>
              <button type="submit" disabled={addLoading}
                className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
                {addLoading ? "Adding..." : "Add User"}
              </button>
            </div>
          </form>
        )}

        {/* SUCCESS */}
        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-950/30 px-5 py-4 text-emerald-400">
            ✅ {successMessage}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-950/30 px-5 py-4 text-red-400">
            {error}
          </div>
        )}

        {/* FILTERS */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 placeholder:text-slate-600"
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as Role | "ALL");
              if (e.target.value !== "ALL") setSearchParams({ role: e.target.value });
              else setSearchParams({});
            }}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="LECTURER">Lecturers</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-4">
            <p className="text-sm text-slate-400">
              Showing <span className="font-semibold text-white">{filtered.length}</span> of{" "}
              <span className="font-semibold text-white">{users.length}</span> users
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">No users found.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filtered.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* USER INFO */}
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${roleColor(u.role)}`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-200">{u.name}</p>
                        {u.id === currentUser?.id && (
                          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">You</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{u.email}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        Joined {new Date(u.createdAt).toLocaleDateString()}
                        {u.role === "STUDENT" && ` · ${u._count.enrollments} modules · ${u._count.submissions} submissions`}
                      </p>
                    </div>
                  </div>

                  {/* ROLE + ACTIONS */}
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${roleColor(u.role)}`}>
                      {u.role}
                    </span>

                    {u.id !== currentUser?.id && (
                      <>
                        <button
                          type="button"
                          onClick={() => { setRoleModalUser(u); setNewRole(u.role); }}
                          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                          Change Role
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModalUser(u)}
                          className="rounded-lg border border-red-900 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-950/50"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* CHANGE ROLE MODAL */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Change Role</h3>
            <p className="mt-1 text-sm text-slate-400">
              Update role for <span className="font-semibold text-white">{roleModalUser.name}</span>
            </p>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
            >
              <option value="STUDENT">STUDENT</option>
              <option value="LECTURER">LECTURER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRoleChange}
                disabled={roleLoading || newRole === roleModalUser.role}
                className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {roleLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER MODAL */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950 text-xl">⚠️</div>
            <h3 className="mt-4 text-lg font-semibold text-white">Delete User?</h3>
            <p className="mt-2 text-sm text-slate-400">
              This will permanently delete{" "}
              <span className="font-semibold text-white">{deleteModalUser.name}</span> and all their data.
              This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                disabled={deleteLoading}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminUsers;
