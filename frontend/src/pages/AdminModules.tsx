import { useEffect, useState } from "react";
import { api } from "../services/api";
import AdminNavbar from "../components/AdminNavbar";

interface Lecturer {
  id: number;
  name: string;
  email: string;
}

interface Module {
  id: number;
  code: string;
  name: string;
  description: string | null;
  credits: number;
  createdAt: string;
  lecturer: Lecturer | null;
  _count: { enrollments: number; assignments: number };
}

function AdminModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");

  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCredits, setNewCredits] = useState("10");
  const [newLecturerId, setNewLecturerId] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<Module | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const [modRes, lecRes] = await Promise.all([
        api.get("/admin/modules"),
        api.get("/admin/lecturers"),
      ]);
      setModules(modRes.data.modules);
      setLecturers(lecRes.data.lecturers);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    if (!newCode.trim() || !newName.trim() || !newCredits) {
      setCreateError("Code, name, and credits are required.");
      return;
    }
    try {
      setCreateLoading(true);
      const res = await api.post("/admin/modules", {
        code: newCode.trim(),
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        credits: Number(newCredits),
        lecturerId: newLecturerId ? Number(newLecturerId) : undefined,
      });
      setModules((prev) => [res.data.module, ...prev]);
      setSuccessMessage(`Module "${res.data.module.code}" created successfully.`);
      setShowCreateForm(false);
      setNewCode(""); setNewName(""); setNewDescription(""); setNewCredits("10"); setNewLecturerId("");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || "Failed to create module");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteModal) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/admin/modules/${deleteModal.id}`);
      setModules((prev) => prev.filter((m) => m.id !== deleteModal.id));
      setSuccessMessage(`Module "${deleteModal.code}" deleted.`);
      setDeleteModal(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete module");
      setDeleteModal(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  const filtered = modules.filter(
    (m) =>
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-violet-400">Admin Panel</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Modules</h1>
            <p className="mt-2 text-slate-400">Create and manage all platform modules.</p>
          </div>
          <button
            type="button"
            onClick={() => { setShowCreateForm((p) => !p); setCreateError(""); }}
            className="shrink-0 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            {showCreateForm ? "Cancel" : "+ Create Module"}
          </button>
        </div>

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

        {/* CREATE FORM */}
        {showCreateForm && (
          <form
            onSubmit={handleCreate}
            className="mb-8 rounded-2xl border border-violet-500/20 bg-slate-900 p-6"
          >
            <h2 className="mb-5 text-lg font-semibold text-white">New Module</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Module Code *
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CS101"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white uppercase outline-none focus:border-violet-500 placeholder:normal-case placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Module Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Introduction to Computer Science"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Credits *
                </label>
                <input
                  type="number"
                  value={newCredits}
                  onChange={(e) => setNewCredits(e.target.value)}
                  min="1"
                  max="60"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Assign Lecturer
                </label>
                <select
                  value={newLecturerId}
                  onChange={(e) => setNewLecturerId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                >
                  <option value="">— No Lecturer —</option>
                  {lecturers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief description of this module..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            {createError && (
              <p className="mt-3 text-sm text-red-400">{createError}</p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {createLoading ? "Creating..." : "Create Module"}
              </button>
            </div>
          </form>
        )}

        {/* SEARCH */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 placeholder:text-slate-600"
          />
        </div>

        {/* MODULES TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-4">
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-white">{filtered.length}</span> modules
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400">Loading modules...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">No modules found.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filtered.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-blue-400">{m.code}</span>
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-500">
                        {m.credits} credits
                      </span>
                    </div>
                    <p className="mt-1 font-medium text-slate-200">{m.name}</p>
                    {m.description && (
                      <p className="mt-1 truncate text-sm text-slate-500">{m.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>👤 {m.lecturer ? m.lecturer.name : "No lecturer"}</span>
                      <span>🎓 {m._count.enrollments} enrolled</span>
                      <span>📝 {m._count.assignments} assignments</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeleteModal(m)}
                    className="shrink-0 rounded-lg border border-red-900 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-950/50"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950 text-xl">⚠️</div>
            <h3 className="mt-4 text-lg font-semibold text-white">Delete Module?</h3>
            <p className="mt-2 text-sm text-slate-400">
              This will permanently delete{" "}
              <span className="font-semibold text-white">{deleteModal.code} — {deleteModal.name}</span>{" "}
              and all its assignments, resources, and enrollments.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
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
                {deleteLoading ? "Deleting..." : "Delete Module"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminModules;
