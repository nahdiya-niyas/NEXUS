
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import LecturerNavbar from "../components/LecturerNavbar";
import { api } from "../services/api";

interface Module {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  credits: number;
}

interface Assignment {
  id: number;
  title: string;
  description?: string | null;
  deadline: string;

  module: {
    id: number;
    code: string;
    name: string;
  };
}

function LecturerSubmissionAssignments() {
  const { moduleId } = useParams();

  const [module, setModule] =
    useState<Module | null>(null);

  const [assignments, setAssignments] =
    useState<Assignment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!moduleId) {
      return;
    }

    loadData();
  }, [moduleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get lecturer's modules
      const moduleResponse = await api.get(
        "/lecturer/modules"
      );

      const allModules: Module[] =
        moduleResponse.data.modules || [];

      const selectedModule = allModules.find(
        (item) =>
          item.id === Number(moduleId)
      );

      if (!selectedModule) {
        setError("Module not found.");
        return;
      }

      setModule(selectedModule);

      // Get lecturer's assignments
      const assignmentResponse =
        await api.get(
          "/lecturer/assignments"
        );

      const allAssignments: Assignment[] =
        assignmentResponse.data.assignments || [];

      // Only assignments belonging to this module
      const moduleAssignments =
        allAssignments
          .filter(
            (assignment) =>
              assignment.module.id ===
              Number(moduleId)
          )
          .sort(
            (a, b) =>
              new Date(
                a.deadline
              ).getTime() -
              new Date(
                b.deadline
              ).getTime()
          );

      setAssignments(moduleAssignments);
    } catch (error: any) {
      console.error(
        "LECTURER SUBMISSION ASSIGNMENTS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load assignments"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (
    date: string
  ) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <LecturerNavbar />

        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-slate-400">
              Loading assignments...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <LecturerNavbar />

        <main className="max-w-7xl mx-auto px-6 py-10">

          <Link
            to="/lecturer/submissions"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to Submissions
          </Link>

          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="font-semibold text-red-400">
              Unable to load assignments
            </p>

            <p className="mt-2 text-slate-400">
              {error || "Module not found."}
            </p>
          </div>

        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <LecturerNavbar />

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* BACK */}

        <Link
          to="/lecturer/submissions"
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Submissions
        </Link>

        {/* HEADER */}

        <div className="mt-6 mb-10">

          <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
            Submissions
          </p>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

            <div>

              <p className="text-sm text-slate-500 mt-3">
                {module.code}
              </p>

              <h1 className="text-4xl font-bold mt-1">
                {module.name}
              </h1>

              <p className="text-slate-400 mt-3">
                Select an assignment to view student submissions.
              </p>

            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4">
              <p className="text-xs text-slate-500">
                Assignments
              </p>

              <p className="text-2xl font-bold mt-1">
                {assignments.length}
              </p>
            </div>

          </div>

        </div>

        {/* EMPTY */}

        {assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-12 text-center">

            <div className="text-5xl mb-4">
              📝
            </div>

            <h2 className="text-xl font-semibold">
              No assignments found
            </h2>

            <p className="text-slate-400 mt-2">
              There are no assignments available
              for this module yet.
            </p>

          </div>
        ) : (

          <div className="space-y-4">

            {assignments.map(
              (assignment) => (

                <Link
                  key={assignment.id}
                  to={`/lecturer/assignments/${assignment.id}`}
                  className="block rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-blue-500/50 transition"
                >

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                    {/* LEFT */}

                    <div className="min-w-0">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                          📄
                        </div>

                        <div>

                          <h2 className="text-xl font-semibold">
                            {assignment.title}
                          </h2>

                          <p className="text-sm text-slate-500 mt-1">
                            {assignment.description ||
                              "No description available."}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div className="flex items-center gap-6">

                      <div className="text-right">

                        <p className="text-xs text-slate-500">
                          Deadline
                        </p>

                        <p className="text-sm text-amber-400 mt-1 whitespace-nowrap">
                          {formatDate(
                            assignment.deadline
                          )}
                        </p>

                      </div>

                      <span className="text-blue-400 text-xl">
                        →
                      </span>

                    </div>

                  </div>

                </Link>

              )
            )}

          </div>

        )}

      </main>

    </div>
  );
}

export default LecturerSubmissionAssignments;
