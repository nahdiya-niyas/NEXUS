
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../services/api";
import LecturerNavbar from "../components/LecturerNavbar";

interface Student {
  id: number;
  name: string;
  email: string;
}

interface Assignment {
  id: number;
  title: string;
  deadline: string;
  _count: {
    submissions: number;
  };
}

interface Resource {
  id: number;
  title: string;
  fileName: string;
  createdAt: string;
}

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

  enrollments: {
    id: number;
    student: Student;
    enrolledAt: string;
  }[];

  assignments: Assignment[];

  resources: Resource[];
}

function LecturerModuleDetails() {
  const { id } = useParams();

  const [module, setModule] =
    useState<Module | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadModule = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/lecturer/modules/${id}`
      );

      setModule(response.data.module);
    } catch (error: any) {
      console.error(
        "LECTURER MODULE DETAILS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load module"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModule();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* SHARED LECTURER NAVBAR */}

      <LecturerNavbar />

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* BACK */}

        <Link
          to="/lecturer/modules"
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          ← Back to My Modules
        </Link>

        {/* LOADING */}

        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-slate-400">
              Loading module...
            </p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-900 bg-red-950/40 p-8">

            <h2 className="text-xl font-semibold text-red-400">
              Unable to load module
            </h2>

            <p className="text-slate-400 mt-2">
              {error}
            </p>

            <button
              type="button"
              onClick={loadModule}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold hover:bg-blue-700 transition"
            >
              Try Again
            </button>

          </div>
        )}

        {/* MODULE */}

        {!loading && !error && module && (
          <>

            {/* MODULE HEADER */}

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">

              <p className="text-blue-400 font-semibold">
                {module.code}
              </p>

              <h1 className="text-4xl font-bold mt-2">
                {module.name}
              </h1>

              <p className="text-slate-400 mt-4 max-w-3xl">
                {module.description ||
                  "No module description available."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">

                <div className="rounded-xl bg-slate-800 p-5">

                  <p className="text-2xl font-bold">
                    {module.credits}
                  </p>

                  <p className="text-sm text-slate-400 mt-1">
                    Credits
                  </p>

                </div>

                <div className="rounded-xl bg-slate-800 p-5">

                  <p className="text-2xl font-bold">
                    {module._count.enrollments}
                  </p>

                  <p className="text-sm text-slate-400 mt-1">
                    Students
                  </p>

                </div>

                <div className="rounded-xl bg-slate-800 p-5">

                  <p className="text-2xl font-bold">
                    {module._count.assignments}
                  </p>

                  <p className="text-sm text-slate-400 mt-1">
                    Assignments
                  </p>

                </div>

                <div className="rounded-xl bg-slate-800 p-5">

                  <p className="text-2xl font-bold">
                    {module._count.resources}
                  </p>

                  <p className="text-sm text-slate-400 mt-1">
                    Resources
                  </p>

                </div>

              </div>

            </section>

            {/* STUDENTS */}

            <section className="mt-8">

              <h2 className="text-2xl font-bold mb-4">
                Enrolled Students
              </h2>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">

                {module.enrollments.length === 0 ? (

                  <p className="p-6 text-slate-400">
                    No students enrolled yet.
                  </p>

                ) : (

                  <div className="divide-y divide-slate-800">

                    {module.enrollments.map(
                      (enrollment) => (

                        <div
                          key={enrollment.id}
                          className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                        >

                          <div>

                            <p className="font-semibold">
                              {enrollment.student.name}
                            </p>

                            <p className="text-sm text-slate-400">
                              {enrollment.student.email}
                            </p>

                          </div>

                          <span className="text-xs text-slate-500">
                            Enrolled{" "}
                            {new Date(
                              enrollment.enrolledAt
                            ).toLocaleDateString()}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </section>

            {/* ASSIGNMENTS */}

            <section className="mt-8">

              <div className="flex items-center justify-between mb-4">

                <h2 className="text-2xl font-bold">
                  Assignments
                </h2>

                <Link
                  to="/lecturer/assignments"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Manage assignments →
                </Link>

              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">

                {module.assignments.length === 0 ? (

                  <p className="p-6 text-slate-400">
                    No assignments yet.
                  </p>

                ) : (

                  <div className="divide-y divide-slate-800">

                    {module.assignments.map(
                      (assignment) => (

                        <div
                          key={assignment.id}
                          className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                        >

                          <div>

                            <p className="font-semibold">
                              {assignment.title}
                            </p>

                            <p className="text-sm text-slate-400 mt-1">
                              Deadline:{" "}
                              {new Date(
                                assignment.deadline
                              ).toLocaleString()}
                            </p>

                          </div>

                          <span className="text-sm text-slate-400">
                            {assignment._count.submissions}{" "}
                            submissions
                          </span>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </section>

            {/* RESOURCES */}

            <section className="mt-8">

              <div className="flex items-center justify-between mb-4">

                <h2 className="text-2xl font-bold">
                  Resources
                </h2>

                <Link
                  to="/lecturer/resources"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Manage resources →
                </Link>

              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">

                {module.resources.length === 0 ? (

                  <p className="p-6 text-slate-400">
                    No resources uploaded yet.
                  </p>

                ) : (

                  <div className="divide-y divide-slate-800">

                    {module.resources.map(
                      (resource) => (

                        <div
                          key={resource.id}
                          className="p-5"
                        >

                          <p className="font-semibold">
                            {resource.title}
                          </p>

                          <p className="text-sm text-slate-400 mt-1">
                            {resource.fileName}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </section>

          </>
        )}

      </main>

    </div>
  );
}

export default LecturerModuleDetails;
