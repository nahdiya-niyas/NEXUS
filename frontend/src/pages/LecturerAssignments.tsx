
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import LecturerNavbar from "../components/LecturerNavbar";
import { api } from "../services/api";

interface Assignment {
  id: number;
  title: string;
  description: string | null;
  deadline: string;
  fileName: string | null;

  module: {
    id: number;
    code: string;
    name: string;
  };

  _count: {
    submissions: number;
  };
}

export default function LecturerAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/lecturer/assignments"
      );

      setAssignments(
        response.data.assignments || []
      );
    } catch (error: any) {
      console.error(
        "LECTURER ASSIGNMENTS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* SHARED LECTURER NAVBAR */}

      <LecturerNavbar />

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* PAGE HEADER */}

        <div className="flex flex-col gap-5 mb-8 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
              Lecturer Portal
            </p>

            <h1 className="text-4xl font-bold mt-2">
              Assignments
            </h1>

            <p className="text-slate-400 mt-3">
              Create and manage assignments for your modules.
            </p>

          </div>

          <Link
            to="/lecturer/assignments/create"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
          >
            + Create Assignment
          </Link>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">

            <p className="text-slate-400">
              Loading assignments...
            </p>

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-900 bg-red-950/40 p-6">

            <p className="font-semibold text-red-400">
              Unable to load assignments
            </p>

            <p className="mt-2 text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadAssignments}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold transition hover:bg-blue-700"
            >
              Try Again
            </button>

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          assignments.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

              <div className="mb-4 text-5xl">
                📝
              </div>

              <h2 className="text-xl font-semibold">
                No assignments created yet
              </h2>

              <p className="mt-2 text-slate-400">
                Create your first assignment to get started.
              </p>

              <Link
                to="/lecturer/assignments/create"
                className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-2.5 font-semibold transition hover:bg-blue-500"
              >
                Create Assignment
              </Link>

            </div>
          )}

        {/* ASSIGNMENTS */}

        {!loading &&
          !error &&
          assignments.length > 0 && (

            <div className="grid gap-5">

              {assignments.map((assignment) => (

                <div
                  key={assignment.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
                >

                  {/* TOP */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0">

                      <p className="text-sm font-semibold text-blue-400">
                        {assignment.module.code} —{" "}
                        {assignment.module.name}
                      </p>

                      <h2 className="mt-2 text-xl font-semibold text-white">
                        {assignment.title}
                      </h2>

                      {assignment.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {assignment.description}
                        </p>
                      )}

                    </div>

                    <Link
                      to={`/lecturer/assignments/${assignment.id}`}
                      className="shrink-0 text-sm font-medium text-blue-400 transition hover:text-blue-300"
                    >
                      View →
                    </Link>

                  </div>

                  {/* DETAILS */}

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

                    {/* DEADLINE */}

                    <div className="rounded-xl bg-slate-800 p-4">

                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Deadline
                      </p>

                      <p className="mt-2 text-sm text-slate-200">
                        {formatDate(
                          assignment.deadline
                        )}
                      </p>

                    </div>

                    {/* SUBMISSIONS */}

                    <div className="rounded-xl bg-slate-800 p-4">

                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Submissions
                      </p>

                      <p className="mt-2 text-sm text-slate-200">
                        {assignment._count.submissions}
                      </p>

                    </div>

                    {/* DOCUMENT */}

                    <div className="rounded-xl bg-slate-800 p-4">

                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Assignment Document
                      </p>

                      <p className="mt-2 truncate text-sm text-slate-200">
                        {assignment.fileName ||
                          "No document uploaded"}
                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

      </main>

    </div>
  );
}
