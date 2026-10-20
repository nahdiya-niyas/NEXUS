
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import PageLayout from "../components/PageLayout";

interface Module {
  id: number;
  code: string;
  name: string;
  credits: number;
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
}

interface DashboardData {
  profile: {
    id: number;
    name: string;
    email: string;
    role: "STUDENT" | "LECTURER" | "ADMIN";
    createdAt: string;
  };

  enrolledModules: Module[];

  assignments: Assignment[];
}

function Dashboard() {
  const { user, logout } = useAuth();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard");

      setDashboard(response.data);
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  if (loading) {
    return <PageLayout title="Dashboard" loading />;
  }

  if (error || !dashboard) {
    return (
      <PageLayout title="Dashboard" error={error || "Dashboard data unavailable"} onRetry={loadDashboard}>
        <></>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`Welcome, ${dashboard.profile.name}`}
      subtitle="Student Dashboard"
      description="Manage your academic activities from one place."
    >

        {/* PROFILE */}

        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-2xl font-semibold">
                Profile
              </h3>

              <p className="text-slate-400 text-sm mt-1">
                Your NEXUS account details
              </p>
            </div>

            <Link
              to="/profile"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View Profile
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="grid md:grid-cols-3 gap-6">

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Name
                </p>

                <p className="text-lg font-medium mt-2">
                  {dashboard.profile.name}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Email
                </p>

                <p className="text-lg font-medium mt-2 break-all">
                  {dashboard.profile.email}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Role
                </p>

                <p className="text-lg font-medium mt-2">
                  {dashboard.profile.role}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* QUICK ACCESS */}

        <section className="mb-10">
          <div className="mb-5">
            <h3 className="text-2xl font-semibold">
              Quick Access
            </h3>

            <p className="text-slate-400 text-sm mt-1">
              Quickly access your main academic areas.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <Link
              to="/modules"
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition"
            >
              <div className="h-11 w-11 rounded-lg bg-slate-800 flex items-center justify-center text-xl">
                📚
              </div>

              <h4 className="text-lg font-semibold mt-4">
                Modules
              </h4>

              <p className="text-slate-500 text-sm mt-2">
                View your enrolled modules and resources.
              </p>
            </Link>

            <Link
              to="/assignments"
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition"
            >
              <div className="h-11 w-11 rounded-lg bg-slate-800 flex items-center justify-center text-xl">
                📝
              </div>

              <h4 className="text-lg font-semibold mt-4">
                Assignments
              </h4>

              <p className="text-slate-500 text-sm mt-2">
                View and submit your upcoming assignments.
              </p>
            </Link>

            <Link
              to="/calendar"
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition"
            >
              <div className="h-11 w-11 rounded-lg bg-slate-800 flex items-center justify-center text-xl">
                📅
              </div>

              <h4 className="text-lg font-semibold mt-4">
                Calendar
              </h4>

              <p className="text-slate-500 text-sm mt-2">
                Check deadlines and academic dates.
              </p>
            </Link>

            <Link
              to="/private-files"
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition"
            >
              <div className="h-11 w-11 rounded-lg bg-slate-800 flex items-center justify-center text-xl">
                🔒
              </div>

              <h4 className="text-lg font-semibold mt-4">
                Private Files
              </h4>

              <p className="text-slate-500 text-sm mt-2">
                Manage your personal documents.
              </p>
            </Link>

          </div>
        </section>

        {/* ENROLLED MODULES */}

        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">

            <div>
              <h3 className="text-2xl font-semibold">
                Enrolled Modules
              </h3>

              <p className="text-slate-400 text-sm mt-1">
                Modules you are currently enrolled in.
              </p>
            </div>

            <Link
              to="/modules"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View All Modules
            </Link>

          </div>

          {dashboard.enrolledModules.length === 0 ? (

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

              <p className="text-slate-400">
                You are not enrolled in any modules yet.
              </p>

              <Link
                to="/modules"
                className="inline-block mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium hover:bg-blue-700"
              >
                Browse Modules
              </Link>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

              {dashboard.enrolledModules.map(
                (module) => (
                  <Link
                    key={module.id}
                    to={`/modules/${module.id}`}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition"
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-blue-400 font-semibold">
                        {module.code}
                      </span>

                      <span className="text-xs bg-slate-800 px-3 py-1 rounded-full">
                        {module.credits} Credits
                      </span>

                    </div>

                    <h4 className="text-xl font-semibold mt-4">
                      {module.name}
                    </h4>

                    <p className="text-slate-500 text-sm mt-4">
                      Open module →
                    </p>

                  </Link>
                )
              )}

            </div>

          )}

        </section>

        {/* UPCOMING ASSIGNMENTS */}

        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">

            <div>
              <h3 className="text-2xl font-semibold">
                Upcoming Assignments
              </h3>

              <p className="text-slate-400 text-sm mt-1">
                Keep track of your upcoming deadlines.
              </p>
            </div>

            <Link
              to="/assignments"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View All
            </Link>

          </div>

          {dashboard.assignments.length === 0 ? (

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

              <p className="text-slate-400">
                No upcoming assignments have been posted yet.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {dashboard.assignments.map(
                (assignment) => {

                  const deadlineSoon =
                    isDeadlineSoon(
                      assignment.deadline
                    );

                  return (
                    <Link
                      key={assignment.id}
                      to={`/assignments/${assignment.id}`}
                      className="block bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500 transition"
                    >

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <h4 className="text-lg font-semibold">
                              {assignment.title}
                            </h4>

                            {deadlineSoon && (
                              <span className="rounded-full bg-red-950 px-2.5 py-1 text-xs font-medium text-red-400">
                                Due soon
                              </span>
                            )}

                          </div>

                          <p className="text-blue-400 text-sm mt-1">
                            {assignment.module.code} —{" "}
                            {assignment.module.name}
                          </p>

                        </div>

                        <div className="md:text-right">

                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Deadline
                          </p>

                          <p
                            className={`text-sm font-medium mt-1 ${
                              deadlineSoon
                                ? "text-red-400"
                                : "text-slate-300"
                            }`}
                          >
                            {formatDeadline(
                              assignment.deadline
                            )}
                          </p>

                        </div>

                      </div>

                    </Link>
                  );
                }
              )}

            </div>

          )}

        </section>

    </PageLayout>
  );
}

function isDeadlineSoon(deadline: string) {
  const deadlineTime =
    new Date(deadline).getTime();

  const now = Date.now();

  const twelveHours =
    12 * 60 * 60 * 1000;

  return (
    deadlineTime > now &&
    deadlineTime - now <= twelveHours
  );
}

function formatDeadline(deadline: string) {
  return new Date(deadline).toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

export default Dashboard;
