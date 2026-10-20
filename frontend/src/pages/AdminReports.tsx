import { useEffect, useState } from "react";
import { api } from "../services/api";
import AdminNavbar from "../components/AdminNavbar";

interface TopModule {
  id: number;
  code: string;
  name: string;
  lecturer: { name: string } | null;
  _count: { enrollments: number; assignments: number };
}

interface ActiveStudent {
  id: number;
  name: string;
  email: string;
  _count: { submissions: number; enrollments: number };
}

interface AssignmentByModule {
  code: string;
  name: string;
  _count: { assignments: number; enrollments: number };
}

interface RecentSubmission {
  id: number;
  submittedAt: string;
  status: "SUBMITTED" | "LATE";
  student: { name: string; email: string };
  assignment: {
    title: string;
    module: { code: string; name: string };
  };
}

interface ReportData {
  topModules: TopModule[];
  submissionStats: { onTime: number; late: number };
  activeStudents: ActiveStudent[];
  assignmentsByModule: AssignmentByModule[];
  recentSubmissions: RecentSubmission[];
}

function AdminReports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { loadReports(); }, []);

  async function loadReports() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/admin/reports");
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <AdminNavbar />
        <div className="flex items-center justify-center py-32">
          <p className="text-slate-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <AdminNavbar />
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="text-red-400">{error}</p>
          <button onClick={loadReports} className="mt-4 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-slate-950">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalSubmissions = data.submissionStats.onTime + data.submissionStats.late;
  const onTimePct = totalSubmissions > 0 ? Math.round((data.submissionStats.onTime / totalSubmissions) * 100) : 0;
  const latePct = totalSubmissions > 0 ? Math.round((data.submissionStats.late / totalSubmissions) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-violet-400">Admin Panel</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Reports</h1>
          <p className="mt-2 text-slate-400">Monitor student activity, submissions, and module performance.</p>
        </div>

        {/* SUBMISSION STATS */}
        <section className="mb-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Submissions</p>
            <p className="mt-3 text-4xl font-bold text-white">{totalSubmissions.toLocaleString()}</p>
            <p className="mt-1 text-sm text-slate-400">All time</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-xs uppercase tracking-wide text-slate-500">On Time</p>
            <p className="mt-3 text-4xl font-bold text-emerald-400">{data.submissionStats.onTime.toLocaleString()}</p>
            <div className="mt-2">
              <div className="h-2 w-full rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${onTimePct}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{onTimePct}% of submissions</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-xs uppercase tracking-wide text-slate-500">Late</p>
            <p className="mt-3 text-4xl font-bold text-red-400">{data.submissionStats.late.toLocaleString()}</p>
            <div className="mt-2">
              <div className="h-2 w-full rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-red-500" style={{ width: `${latePct}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{latePct}% of submissions</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* TOP MODULES BY ENROLLMENT */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 px-6 py-5">
              <h2 className="font-semibold text-white">Top Modules by Enrollment</h2>
              <p className="mt-1 text-xs text-slate-500">Modules with the most enrolled students</p>
            </div>
            <div className="divide-y divide-slate-800">
              {data.topModules.map((m, i) => (
                <div key={m.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-400">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-blue-400">{m.code}</p>
                      <p className="text-xs text-slate-400">{m.name}</p>
                      <p className="text-xs text-slate-600">{m.lecturer ? m.lecturer.name : "No lecturer"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{m._count.enrollments}</p>
                    <p className="text-xs text-slate-500">students</p>
                    <p className="text-xs text-slate-600">{m._count.assignments} assignments</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* MOST ACTIVE STUDENTS */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 px-6 py-5">
              <h2 className="font-semibold text-white">Most Active Students</h2>
              <p className="mt-1 text-xs text-slate-500">Ranked by number of submissions</p>
            </div>
            <div className="divide-y divide-slate-800">
              {data.activeStudents.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-400">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{s._count.submissions}</p>
                    <p className="text-xs text-slate-500">submissions</p>
                    <p className="text-xs text-slate-600">{s._count.enrollments} modules</p>
                  </div>
                </div>
              ))}
              {data.activeStudents.length === 0 && (
                <div className="py-10 text-center text-sm text-slate-500">No submissions yet.</div>
              )}
            </div>
          </section>

          {/* RECENT SUBMISSIONS */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 lg:col-span-2">
            <div className="border-b border-slate-800 px-6 py-5">
              <h2 className="font-semibold text-white">Recent Submissions</h2>
              <p className="mt-1 text-xs text-slate-500">Latest 10 assignment submissions across the platform</p>
            </div>
            {data.recentSubmissions.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">No submissions yet.</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {data.recentSubmissions.map((sub) => (
                  <div key={sub.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-slate-200">{sub.student.name}</p>
                      <p className="text-xs text-slate-500">{sub.student.email}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        <span className="text-blue-400">{sub.assignment.module.code}</span> — {sub.assignment.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                        sub.status === "LATE"
                          ? "border-red-500/20 bg-red-500/10 text-red-400"
                          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {sub.status === "LATE" ? "Late" : "On Time"}
                      </span>
                      <p className="text-xs text-slate-500">{new Date(sub.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

      </main>
    </div>
  );
}

export default AdminReports;
