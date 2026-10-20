
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LecturerNavbar from "../components/LecturerNavbar";

interface LecturerProfile {
  id: number;
  name: string;
  email: string;
  role: "LECTURER";
  createdAt: string;
}

interface Module {
  id: number;
  code: string;
  name: string;
  description: string | null;
  credits: number;

  _count: {
    enrollments: number;
    assignments: number;
    resources: number;
  };
}

interface Assignment {
  id: number;
  title: string;
  description: string | null;
  deadline: string;

  module: {
    id: number;
    code: string;
    name: string;
  };

  _count: {
    submissions: number;
  };
}

interface LecturerDashboardData {
  profile: LecturerProfile;

  statistics: {
    modules: number;
    students: number;
    assignments: number;
    resources: number;
  };

  modules: Module[];

  assignments: Assignment[];
}

function LecturerDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] =
    useState<LecturerDashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/lecturer/dashboard"
        );

      setDashboard(response.data);
    } catch (error: any) {
      console.error(
        "LECTURER DASHBOARD ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load lecturer dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDeadline(
    deadline: string
  ) {
    return new Date(
      deadline
    ).toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">

        <LecturerNavbar />

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-slate-300">
              Loading lecturer dashboard...
            </p>
          </div>
        </main>

      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">

        <LecturerNavbar />

        <main className="max-w-7xl mx-auto px-6 py-12">

          <div className="mx-auto max-w-md rounded-2xl border border-red-500/30 bg-slate-900 p-8 text-center">

            <h1 className="text-xl font-semibold">
              Unable to load lecturer dashboard
            </h1>

            <p className="mt-3 text-red-400">
              {error ||
                "Dashboard data unavailable"}
            </p>

            <button
              type="button"
              onClick={loadDashboard}
              className="mt-5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Try Again
            </button>

          </div>

        </main>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <LecturerNavbar />

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* WELCOME */}

        <section className="mb-10">

          <p className="text-blue-400 font-medium">
            Lecturer Dashboard
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            Welcome, {dashboard.profile.name}
          </h2>

          <p className="mt-2 text-slate-400">
            Manage your modules, assignments,
            resources, and student submissions.
          </p>

        </section>

        {/* STATISTICS */}

        <section className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">
              My Modules
            </p>

            <p className="mt-2 text-3xl font-bold">
              {dashboard.statistics.modules}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">
              Students
            </p>

            <p className="mt-2 text-3xl font-bold">
              {dashboard.statistics.students}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">
              Assignments
            </p>

            <p className="mt-2 text-3xl font-bold">
              {dashboard.statistics.assignments}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">
              Resources
            </p>

            <p className="mt-2 text-3xl font-bold">
              {dashboard.statistics.resources}
            </p>
          </div>

        </section>

        {/* QUICK ACTIONS */}

        <section className="mb-10">

          <h3 className="mb-5 text-2xl font-semibold">
            Quick Actions
          </h3>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <Link
              to="/lecturer/modules"
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800 text-xl">
                📚
              </div>

              <h4 className="mt-4 text-lg font-semibold">
                My Modules
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Manage the modules you teach.
              </p>
            </Link>

            <Link
              to="/lecturer/assignments"
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800 text-xl">
                📝
              </div>

              <h4 className="mt-4 text-lg font-semibold">
                Assignments
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Create and manage assignments.
              </p>
            </Link>

            <Link
              to="/lecturer/resources"
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800 text-xl">
                📂
              </div>

              <h4 className="mt-4 text-lg font-semibold">
                Resources
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Upload learning resources.
              </p>
            </Link>

            <Link
              to="/lecturer/submissions"
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800 text-xl">
                📥
              </div>

              <h4 className="mt-4 text-lg font-semibold">
                Submissions
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Review student submissions.
              </p>
            </Link>

          </div>

        </section>

        {/* MY MODULES */}

        <section className="mb-10">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h3 className="text-2xl font-semibold">
                My Modules
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Modules assigned to you.
              </p>
            </div>

            <Link
              to="/lecturer/modules"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View All
            </Link>

          </div>

          {dashboard.modules.length === 0 ? (

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
              <p className="text-slate-400">
                No modules are assigned to you yet.
              </p>
            </div>

          ) : (

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {dashboard.modules.map(
                (module) => (

                  <Link
                    key={module.id}
                    to={`/lecturer/modules/${module.id}`}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-blue-500"
                  >

                    <div className="flex items-center justify-between">

                      <span className="font-semibold text-blue-400">
                        {module.code}
                      </span>

                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">
                        {module.credits} Credits
                      </span>

                    </div>

                    <h4 className="mt-4 text-xl font-semibold">
                      {module.name}
                    </h4>

                    <div className="mt-6 grid grid-cols-3 gap-3">

                      <div>
                        <p className="text-xs text-slate-500">
                          Students
                        </p>

                        <p className="mt-1 font-semibold">
                          {module._count.enrollments}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Assignments
                        </p>

                        <p className="mt-1 font-semibold">
                          {module._count.assignments}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Resources
                        </p>

                        <p className="mt-1 font-semibold">
                          {module._count.resources}
                        </p>
                      </div>

                    </div>

                  </Link>

                )
              )}

            </div>

          )}

        </section>

        {/* UPCOMING ASSIGNMENTS */}

        <section>

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h3 className="text-2xl font-semibold">
                Upcoming Assignments
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Assignments created by you.
              </p>
            </div>

            <Link
              to="/lecturer/assignments"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View All
            </Link>

          </div>

          {dashboard.assignments.length === 0 ? (

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
              <p className="text-slate-400">
                No assignments have been created yet.
              </p>
            </div>

          ) : (

            <div className="space-y-4">

              {dashboard.assignments
                .slice(0, 5)
                .map((assignment) => (

                  <Link
                    key={assignment.id}
                    to={`/lecturer/assignments/${assignment.id}`}
                    className="block rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500"
                  >

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                      <div>

                        <h4 className="text-lg font-semibold">
                          {assignment.title}
                        </h4>

                        <p className="mt-1 text-sm text-blue-400">
                          {assignment.module.code} —{" "}
                          {assignment.module.name}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {assignment._count.submissions}{" "}
                          student
                          {assignment._count.submissions !== 1
                            ? "s"
                            : ""}{" "}
                          submitted
                        </p>

                      </div>

                      <div className="md:text-right">

                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Deadline
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatDeadline(
                            assignment.deadline
                          )}
                        </p>

                      </div>

                    </div>

                  </Link>

                ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default LecturerDashboard;
