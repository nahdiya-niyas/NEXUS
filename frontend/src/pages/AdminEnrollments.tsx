import { useEffect, useState } from "react";
import { api } from "../services/api";
import AdminNavbar from "../components/AdminNavbar";

interface Student { id: number; name: string; email: string; }
interface Module  { id: number; code: string; name: string; }

interface Enrollment {
  id: number;
  enrolledAt: string;
  student: Student;
  module: Module;
}

function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  // Enroll form
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  // Remove modal
  const [removeModal, setRemoveModal] = useState<Enrollment | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const [enrRes, stuRes, modRes] = await Promise.all([
        api.get("/admin/enrollments"),
        api.get("/admin/students"),
        api.get("/admin/modules"),
      ]);
      setEnrollments(enrRes.data.enrollments);
      setStudents(stuRes.data.students);
      setModules(modRes.data.modules);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    setEnrollError("");
    if (!selectedStudent || !selectedModule) {
      setEnrollError("Please select both a student and a module.");
      return;
    }
    try {
      setEnrollLoading(true);
      const res = await api.post("/admin/enrollments", {
        studentId: Number(selectedStudent),
        moduleId: Number(selectedModule),
      });
      setEnrollments((prev) => [res.data.enrollment, ...prev]);
      setSuccess(`${res.data.enrollment.student.name} enrolled in ${res.data.enrollment.module.code}.`);
      setShowForm(false);
      setSelectedStudent(""); setSelectedModule("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setEnrollError(err.response?.data?.message || "Failed to enroll student");
    } finally {
      setEnrollLoading(false);
    }
  }

  async function handleRemove() {
    if (!removeModal) return;
    try {
      setRemoveLoading(true);
      await api.delete(`/admin/enrollments/${removeModal.id}`);
      setEnrollments((prev) => prev.filter((e) => e.id !== removeModal.id));
      setSuccess(`Enrollment removed for ${removeModal.student.name}.`);
      setRemoveModal(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove enrollment");
      setRemoveModal(null);
    } finally {
      setRemoveLoading(false);
    }
  }

  const filtered = enrollments.filter(
    (e) =>
      e.student.name.toLowerCase().includes(search.toLowerCase()) ||
      e.student.email.toLowerCase().includes(search.toLowerCase()) ||
      e.module.code.toLowerCase().includes(search.toLowerCase()) ||
      e.module.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-violet-400">Admin Panel</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Enrollments</h1>
            <p className="mt-2 text-slate-400">Register students into modules and manage existing enrollments.</p>
          </div>
          <button
            type="button"
            onClick={() => { setShowForm((p) => !p); setEnrollError(""); }}
            className="shrink-0 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            {showForm ? "Cancel" : "+ Enroll Student"}
          </button>
        </div>

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-950/30 px-5 py-4 text-emerald-400">
            ✅ {success}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-950/30 px-5 py-4 text-red-400">
            {error}
          </div>
        )}

        {/* ENROLL FORM */}
        {showForm && (
          <form onSubmit={handleEnroll} className="mb-8 rounded-2xl border border-violet-500/20 bg-slate-900 p-6">
            <h2 className="mb-5 text-lg font-semibold text-white">Enroll a Student</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Student *</label>
                <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500">
                  <option value="">— Select a student —</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Module *</label>
                <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500">
                  <option value="">— Select a module —</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.code} — {m.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {enrollError && <p className="mt-3 text-sm text-red-400">{enrollError}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800">
                Cancel
              </button>
              <button type="submit" disabled={enrollLoading}
                className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
                {enrollLoading ? "Enrolling..." : "Enroll Student"}
              </button>
            </div>
          </form>
        )}

        {/* SEARCH */}
        <div className="mb-5">
          <input type="text" placeholder="Search by student or module..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 placeholder:text-slate-600" />
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-4">
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-white">{filtered.length}</span> enrollments
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400">Loading enrollments...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">No enrollments found.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filtered.map((e) => (
                <div key={e.id} className="flex flex-col gap-4 px-6 py-5 hover:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-700 bg-emerald-900/30 text-sm font-semibold text-emerald-300">
                      {e.student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{e.student.name}</p>
                      <p className="text-xs text-slate-500">{e.student.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right sm:text-left">
                      <p className="text-sm font-semibold text-blue-400">{e.module.code}</p>
                      <p className="text-xs text-slate-400">{e.module.name}</p>
                      <p className="text-xs text-slate-600">Enrolled {new Date(e.enrolledAt).toLocaleDateString()}</p>
                    </div>
                    <button type="button" onClick={() => setRemoveModal(e)}
                      className="rounded-lg border border-red-900 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-950/50">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* REMOVE MODAL */}
      {removeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950 text-xl">⚠️</div>
            <h3 className="mt-4 text-lg font-semibold text-white">Remove Enrollment?</h3>
            <p className="mt-2 text-sm text-slate-400">
              Remove <span className="font-semibold text-white">{removeModal.student.name}</span> from{" "}
              <span className="font-semibold text-white">{removeModal.module.code} — {removeModal.module.name}</span>?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setRemoveModal(null)} disabled={removeLoading}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800">
                Cancel
              </button>
              <button type="button" onClick={handleRemove} disabled={removeLoading}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {removeLoading ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEnrollments;
