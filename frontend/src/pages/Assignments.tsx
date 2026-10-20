
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../services/api";
import PageLayout from "../components/PageLayout";

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

  submissions: {
    id: number;
    submittedAt: string;
    status: "SUBMITTED" | "LATE";
    fileName: string;
  }[];
}

function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const response = await api.get("/assignments");

        const allAssignments: Assignment[] =
          response.data.assignments || [];

        const now = new Date();

        // Show only assignments whose deadline has not passed.
        const upcomingAssignments = allAssignments.filter(
          (assignment) => {
            const deadline = new Date(assignment.deadline);

            return deadline >= now;
          }
        );

        // Nearest deadline first.
        upcomingAssignments.sort(
          (a, b) =>
            new Date(a.deadline).getTime() -
            new Date(b.deadline).getTime()
        );

        setAssignments(upcomingAssignments);
      } catch (error: any) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to load assignments"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  if (loading) {
    return (
      <PageLayout title="Assignments" loading />
    );
  }

  return (
    <PageLayout
      title="Assignments"
      subtitle="Student Workspace"
      description="Stay on top of your upcoming academic deadlines."
    >

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {/* NO ASSIGNMENTS */}

        {assignments.length === 0 ? (

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

            <div className="text-4xl mb-4">
              🎉
            </div>

            <h3 className="text-xl font-semibold">
              No upcoming assignments
            </h3>

            <p className="text-slate-400 mt-2">
              You have no upcoming assignments at the moment.
            </p>

            <p className="text-slate-500 text-sm mt-4">
              Past assignments and submissions can be accessed
              through their respective module pages.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {assignments.map((assignment) => {

              const submission =
                assignment.submissions[0];

              return (
                <Link
                  key={assignment.id}
                  to={`/assignments/${assignment.id}`}
                  className="block bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    {/* ASSIGNMENT INFO */}

                    <div>

                      <p className="text-blue-400 text-sm font-semibold">
                        {assignment.module.code} —{" "}
                        {assignment.module.name}
                      </p>

                      <h3 className="text-xl font-semibold mt-2">
                        {assignment.title}
                      </h3>

                      {assignment.description && (
                        <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                          {assignment.description}
                        </p>
                      )}

                    </div>

                    {/* DEADLINE + STATUS */}

                    <div className="lg:text-right">

                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Deadline
                      </p>

                      <p className="text-sm font-medium mt-1 text-slate-300">
                        {formatDeadline(
                          assignment.deadline
                        )}
                      </p>

                      <div className="mt-3">

                        {submission ? (

                          <span
                            className={
                              submission.status === "LATE"
                                ? "inline-block rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400"
                                : "inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400"
                            }
                          >
                            {submission.status === "LATE"
                              ? "Submitted Late"
                              : "Submitted"}
                          </span>

                        ) : (

                          <span className="inline-block rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                            Not Submitted
                          </span>

                        )}

                      </div>

                    </div>

                  </div>

                </Link>
              );
            })}

          </div>

        )}

    </PageLayout>
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

export default Assignments;
