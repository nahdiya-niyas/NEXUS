import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AdminNavbar from "../components/AdminNavbar";

interface Stats {
  totalStudents: number;
  totalLecturers: number;
  totalAdmins: number;
  totalModules: number;
  totalAssignments: number;
  totalSubmissions: number;
  totalEnrollments: number;
}

interface RecentUser {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "LECTURER" | "ADMIN";
  createdAt: string;
}

interface RecentModule {
  id: number;
  code: string;
  name: string;
  credits: number;
  createdAt: string;
  lecturer: { name: string } | null;
  _count: { enrollments: number };
}

function AdminDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentModules, setRecentModules] = useState<RecentModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/admin/stats");
      setStats(res.data.stats);
      setRecentUsers(res.data.recentUsers);
      setRecentModules(res.data.recentModules);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  const roleColor = (role: string) => {
    if (role === "ADMIN") return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    if (role === "LECTURER") return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <AdminNavbar />
        <div className="flex items-center justify-center py-32">
          <p className="text-slate-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <AdminNavbar />
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="text-red-400">{error}</p>
          <button onClick={loadStats} className="mt-4 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-slate-950">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-wide text-violet-400">Admin Panel</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-slate-400">Platform overview and quick statistics.</p>
        </div>

        {/* STAT CARDS */}
        {stats && (
          <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <Link to="/admin/users?role=STUDENT" className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-emerald-500/50">
              <p className="text-xs uppercase tracking-wide text-slate-500">Students</p>
              <p className="mt-3 text-4xl font-bold text-white">{stats.totalStudents.toLocaleString()}</p>
              <p className="mt-1 text-sm text-emerald-400">Registered students</p>
            </Link>

            <Link to="/admin/users?role=LECTURER" className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500/50">
              <p className="text-xs uppercase tracking-wide text-slate-500">Lecturers</p>
              <p className="mt-3 text-4xl font-bold text-white">{stats.totalLecturers.toLocaleString()}</p>
              <p className="mt-1 text-sm text-blue-400">Teaching staff</p>
            </Link>

            <Link to="/admin/modules" className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-violet-500/50">
              <p className="text-xs uppercase tracking-wide text-slate-500">Modules</p>
              <p className="mt-3 text-4xl font-bold text-white">{stats.totalModules.toLocaleString()}</p>
              <p className="mt-1 text-sm text-violet-400">Active modules</p>
            </Link>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-xs uppercase tracking-wide text-slate-500">Assignments</p>
              <p className="mt-3 text-4xl font-bold text-white">{stats.totalAssignments.toLocaleString()}</p>
              <p className="mt-1 text-sm text-amber-400">Total posted</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-xs uppercase tracking-wide text-slate-500">Submissions</p>
              <p className="mt-3 text-4xl font-bold text-white">{stats.totalSubmissions.toLocaleString()}</p>
              <p className="mt-1 text-sm text-slate-400">Total received</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-xs uppercase tracking-wide text-slate-500">Enrollments</p>
              <p className="mt-3 text-4xl font-bold text-white">{stats.totalEnrollments.toLocaleString()}</p>
              <p className="mt-1 text-sm text-slate-400">Student–module pairs</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Users</p>
              <p className="mt-3 text-4xl font-bold text-white">
                {(stats.totalStudents + stats.totalLecturers + stats.totalAdmins).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-slate-400">Across all roles</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-xs uppercase tracking-wide text-slate-500">Admins</p>
              <p className="mt-3 text-4xl font-bold text-white">{stats.totalAdmins}</p>
              <p className="mt-1 text-sm text-violet-400">Admin accounts</p>
            </div>

          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* RECENT USERS */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <h2 className="font-semibold text-white">Recently Registered</h2>
              <Link to="/admin/users" className="text-sm text-violet-400 hover:text-violet-300">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-slate-800">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-300">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${roleColor(u.role)}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* RECENT MODULES */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <h2 className="font-semibold text-white">Recently Added Modules</h2>
              <Link to="/admin/modules" className="text-sm text-violet-400 hover:text-violet-300">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-slate-800">
              {recentModules.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-blue-400">{m.code}</p>
                    <p className="text-sm text-slate-300">{m.name}</p>
                    <p className="text-xs text-slate-500">
                      {m.lecturer ? `👤 ${m.lecturer.name}` : "No lecturer assigned"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
                      {m._count.enrollments} enrolled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

      </main>
    </div>
  );
}

export default AdminDashboard;
