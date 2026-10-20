import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../services/api";
import Navbar from "../components/Navbar";

interface Submission {
  id: number;
  fileName: string;
  submittedAt: string;
  status: "SUBMITTED" | "LATE";
}

interface Assignment {
  id: number;
  title: string;
  description: string | null;
  deadline: string;
  module: { id: number; code: string; name: string };
  submissions: Submission[];
}

function AssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");

  const loadAssignment = async () => {
    try {
      setLoading(true);
      setPageError("");
      const response = await api.get(`/assignments/${id}`);
      setAssignment(response.data.assignment);
    } catch (err: any) {
      setPageError(err.response?.data?.message || "Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAssignment(); }, [id]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) { setError("Please select a file first."); return; }
    setSubmitting(true); setMessage(""); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post(`/assignments/${id}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Assignment submitted successfully.");
      setFile(null);
      await loadAssignment();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <p className="text-slate-400">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-12">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back
          </button>
          <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-8 text-center">
            <p className="text-red-400">{pageError}</p>
            <button onClick={loadAssignment} className="mt-4 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-slate-950">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) return null;

  const submission = assignment.submissions[0];
  const deadlinePassed = new Date(assignment.deadline).getTime() < Date.now();
  const overdueDays = getOverdueDays(assignment.deadline);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* ← BACK BUTTON */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          ← Back to Assignments
        </button>

        {/* PAGE HEADER */}
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
            {assignment.module.code} — {assignment.module.name}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">{assignment.title}</h1>
        </div>

        {/* ASSIGNMENT INFO */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">Instructions</h2>
              <p className="mt-3 leading-relaxed text-slate-300 whitespace-pre-wrap">
                {assignment.description || "No additional instructions provided."}
              </p>
            </div>
            <div className={`shrink-0 rounded-xl border px-5 py-4 text-center ${deadlinePassed ? "border-red-500/20 bg-red-950/30" : "border-amber-500/20 bg-amber-950/20"}`}>
              <p className="text-xs uppercase tracking-wide text-slate-500">Deadline</p>
              <p className={`mt-1 text-sm font-semibold ${deadlinePassed ? "text-red-400" : "text-amber-400"}`}>
                {new Date(assignment.deadline).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
              </p>
              {deadlinePassed && (
                <p className="mt-1 text-xs text-red-500">
                  Overdue by {overdueDays} {overdueDays === 1 ? "day" : "days"}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* SUBMISSION */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white">Your Submission</h2>

          {submission ? (
            <div className="mt-5 rounded-xl border border-green-500/20 bg-green-500/5 p-5">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <p className={`font-semibold ${submission.status === "LATE" ? "text-amber-400" : "text-green-400"}`}>
                  {submission.status === "LATE" ? "Submitted Late" : "Submitted On Time"}
                </p>
              </div>
              <p className="mt-2 text-sm text-slate-300">{submission.fileName}</p>
              <p className="mt-1 text-xs text-slate-500">
                Submitted {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="mt-5">
              {deadlinePassed ? (
                <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="font-semibold text-red-400">🔴 Overdue — {overdueDays} {overdueDays === 1 ? "day" : "days"} late</p>
                  <p className="mt-1 text-sm text-slate-400">You can still submit. It will be recorded as late.</p>
                </div>
              ) : (
                <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="font-semibold text-amber-400">🟡 Not Submitted Yet</p>
                  <p className="mt-1 text-sm text-slate-400">Upload your work before the deadline.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Upload your answer document
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-blue-700"
                  />
                  {file && <p className="mt-2 text-sm text-slate-400">Selected: {file.name}</p>}
                  <p className="mt-1 text-xs text-slate-600">Maximum file size: 10 MB</p>
                </div>

                {error && <div className="rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">{error}</div>}
                {message && <div className="rounded-lg border border-green-800 bg-green-950/40 px-4 py-3 text-sm text-green-300">{message}</div>}

                <button
                  type="submit"
                  disabled={submitting || !file}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : deadlinePassed ? "Submit Late Assignment" : "Submit Assignment"}
                </button>
              </form>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

function getOverdueDays(deadline: string) {
  const diff = Date.now() - new Date(deadline).getTime();
  if (diff <= 0) return 0;
  return Math.max(1, Math.floor(diff / (24 * 60 * 60 * 1000)));
}

export default AssignmentDetails;
