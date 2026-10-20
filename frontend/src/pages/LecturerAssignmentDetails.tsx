import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LecturerNavbar from "../components/LecturerNavbar";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface Submission {
  id: number;
  fileName: string;
  filePath: string;
  submittedAt: string;
  status: "SUBMITTED" | "LATE";

  student: {
    id: number;
    name: string;
    email: string;
  };
}

interface Assignment {
  id: number;
  title: string;
  description: string | null;
  deadline: string;

  fileName: string | null;
  filePath: string | null;

  module: {
    id: number;
    code: string;
    name: string;
  };

  submissions: Submission[];
}

export default function LecturerAssignmentDetails() {
  const { id } = useParams();
  const { logout } = useAuth();

  const [assignment, setAssignment] =
    useState<Assignment | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadAssignment();
    }
  }, [id]);

  const loadAssignment = async () => {
    try {
      const response = await api.get(
        `/lecturer/assignments/${id}`
      );

      setAssignment(response.data.assignment);
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Failed to load assignment."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const downloadSubmission = async (
    submissionId: number,
    fileName: string
  ) => {
    try {
      const response = await api.get(
        `/lecturer/submissions/${submissionId}/file`,
        {
          responseType: "blob",
        }
      );

      const blobUrl = window.URL.createObjectURL(
        response.data
      );

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error(error);

      alert(
        "Failed to download the student's answer."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading assignment...
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <nav className="border-b border-slate-800 bg-slate-900">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link
              to="/lecturer/assignments"
              className="text-blue-400"
            >
              ← Back to Assignments
            </Link>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-6 py-10">
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-6">
            {error || "Assignment not found."}
          </div>
        </main>
      </div>
    );
  }

  const totalSubmissions =
    assignment.submissions.length;

  const submittedCount =
    assignment.submissions.filter(
      (submission) =>
        submission.status === "SUBMITTED"
    ).length;

  const lateCount =
    assignment.submissions.filter(
      (submission) =>
        submission.status === "LATE"
    ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}

      <nav className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link
            to="/lecturer-dashboard"
            className="text-2xl font-bold"
          >
            NEXUS
          </Link>

          <div className="flex items-center gap-6 text-sm">

            <Link
              to="/lecturer-dashboard"
              className="text-slate-300 hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              to="/lecturer/modules"
              className="text-slate-300 hover:text-white"
            >
              My Modules
            </Link>

            <Link
              to="/lecturer/assignments"
              className="text-blue-400"
            >
              Assignments
            </Link>

            <button
              onClick={logout}
              className="text-red-400 hover:text-red-300"
            >
              Logout
            </button>

          </div>
        </div>
      </nav>


      <main className="max-w-7xl mx-auto px-6 py-10">

        <Link
          to="/lecturer/assignments"
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          ← Back to Assignments
        </Link>


        {/* ASSIGNMENT INFORMATION */}

        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-8">

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

            <div>

              <p className="text-blue-400 font-semibold">
                {assignment.module.code}
              </p>

              <h1 className="text-3xl font-bold mt-2">
                {assignment.title}
              </h1>

              <p className="text-slate-400 mt-2">
                {assignment.module.name}
              </p>

            </div>

            <div className="bg-slate-800 rounded-xl px-5 py-4">

              <p className="text-xs text-slate-500">
                Deadline
              </p>

              <p className="text-sm font-medium mt-1">
                {formatDate(assignment.deadline)}
              </p>

            </div>

          </div>


          {/* INSTRUCTIONS */}

          {assignment.description && (
            <div className="mt-8">

              <h2 className="text-lg font-semibold">
                Instructions
              </h2>

              <p className="text-slate-400 mt-2 whitespace-pre-wrap">
                {assignment.description}
              </p>

            </div>
          )}


          {/* ASSIGNMENT DOCUMENT */}

          <div className="mt-8">

            <h2 className="text-lg font-semibold">
              Assignment Document
            </h2>

            {assignment.fileName ? (
              <div className="mt-3 bg-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">

                <div>

                  <p className="font-medium">
                    📄 {assignment.fileName}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Lecturer uploaded document
                  </p>

                </div>

                <a
                  href={`http://localhost:3001${assignment.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Open
                </a>

              </div>
            ) : (
              <p className="text-slate-500 mt-3">
                No assignment document uploaded.
              </p>
            )}

          </div>

        </div>


        {/* STATISTICS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

            <p className="text-slate-500 text-sm">
              Total submissions
            </p>

            <p className="text-3xl font-bold mt-2">
              {totalSubmissions}
            </p>

          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

            <p className="text-slate-500 text-sm">
              Submitted on time
            </p>

            <p className="text-3xl font-bold mt-2">
              {submittedCount}
            </p>

          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">

            <p className="text-slate-500 text-sm">
              Late submissions
            </p>

            <p className="text-3xl font-bold mt-2">
              {lateCount}
            </p>

          </div>

        </div>


        {/* STUDENT SUBMISSIONS */}

        <div className="mt-8">

          <div className="mb-5">

            <h2 className="text-2xl font-bold">
              Student Submissions
            </h2>

            <p className="text-slate-400 mt-1">
              View and download student answer documents.
            </p>

          </div>


          {assignment.submissions.length === 0 ? (

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">

              <p className="text-slate-400">
                No students have submitted this assignment yet.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {assignment.submissions.map(
                (submission) => (

                  <div
                    key={submission.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-6"
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                      {/* STUDENT */}

                      <div>

                        <h3 className="font-semibold text-lg">
                          {submission.student.name}
                        </h3>

                        <p className="text-sm text-slate-400">
                          {submission.student.email}
                        </p>

                        <p className="text-sm text-slate-500 mt-2">
                          Submitted:{" "}
                          {formatDate(
                            submission.submittedAt
                          )}
                        </p>

                      </div>


                      {/* FILE + STATUS */}

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            submission.status ===
                            "LATE"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-green-500/10 text-green-400 border border-green-500/20"
                          }`}
                        >
                          {submission.status}
                        </span>


                        <span className="text-sm text-slate-400">
                          📄 {submission.fileName}
                        </span>


                        <button
                          onClick={() =>
                            downloadSubmission(
                              submission.id,
                              submission.fileName
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
                        >
                          Download Answer
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}