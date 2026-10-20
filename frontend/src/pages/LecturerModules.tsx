
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../services/api";
import LecturerNavbar from "../components/LecturerNavbar";

interface Module {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  credits: number;

  _count: {
    enrollments: number;
    assignments: number;
    resources: number;
  };
}

function LecturerModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadModules = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/lecturer/modules"
      );

      setModules(
        response.data.modules || []
      );
    } catch (error: any) {
      console.error(
        "LECTURER MODULES ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load modules"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* SHARED LECTURER NAVBAR */}

      <LecturerNavbar />

      {/* MAIN */}

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* PAGE HEADER */}

        <div className="mb-10">

          <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
            Lecturer Portal
          </p>

          <h1 className="text-4xl font-bold mt-2">
            My Modules
          </h1>

          <p className="text-slate-400 mt-3">
            Manage the modules assigned to you.
          </p>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">

            <p className="text-slate-400">
              Loading your modules...
            </p>

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-900 bg-red-950/40 p-8">

            <p className="text-red-400 font-semibold">
              Unable to load modules
            </p>

            <p className="text-slate-400 mt-2">
              {error}
            </p>

            <button
              type="button"
              onClick={loadModules}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold hover:bg-blue-700 transition"
            >
              Try Again
            </button>

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          modules.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

              <div className="text-5xl mb-4">
                📚
              </div>

              <h2 className="text-xl font-semibold">
                No modules assigned
              </h2>

              <p className="text-slate-400 mt-2">
                You currently don't have any
                modules assigned to you.
              </p>

            </div>
          )}

        {/* MODULES */}

        {!loading &&
          !error &&
          modules.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              {modules.map((module) => (
                <div
                  key={module.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-blue-500/50 transition"
                >

                  {/* MODULE HEADER */}

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-blue-400 font-semibold text-sm">
                        {module.code}
                      </p>

                      <h2 className="text-xl font-bold mt-2">
                        {module.name}
                      </h2>

                    </div>

                    <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 whitespace-nowrap">
                      {module.credits} Credits
                    </span>

                  </div>

                  {/* DESCRIPTION */}

                  <p className="text-slate-400 text-sm mt-4 min-h-[48px]">
                    {module.description ||
                      "No module description available."}
                  </p>

                  {/* STATISTICS */}

                  <div className="grid grid-cols-3 gap-3 mt-6">

                    <div className="rounded-xl bg-slate-800/70 p-3 text-center">

                      <p className="text-xl font-bold">
                        {module._count.enrollments}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Students
                      </p>

                    </div>

                    <div className="rounded-xl bg-slate-800/70 p-3 text-center">

                      <p className="text-xl font-bold">
                        {module._count.assignments}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Assignments
                      </p>

                    </div>

                    <div className="rounded-xl bg-slate-800/70 p-3 text-center">

                      <p className="text-xl font-bold">
                        {module._count.resources}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Resources
                      </p>

                    </div>

                  </div>

                  {/* OPEN MODULE */}

                  <Link
                    to={`/lecturer/modules/${module.id}`}
                    className="block w-full text-center mt-6 rounded-lg bg-blue-600 hover:bg-blue-700 py-3 font-semibold transition"
                  >
                    Open Module
                  </Link>

                </div>
              ))}

            </div>
          )}

      </main>

    </div>
  );
}

export default LecturerModules;
