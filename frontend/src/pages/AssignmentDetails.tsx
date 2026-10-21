import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import AppShell from "../components/AppShell";

interface Submission { id: number; fileName: string; submittedAt: string; status: "SUBMITTED" | "LATE"; }
interface Assignment {
  id: number; title: string; description: string | null; deadline: string;
  module: { id: number; code: string; name: string };
  submissions: Submission[];
}

function overdueDays(d: string) { return Math.max(1, Math.floor((Date.now() - new Date(d).getTime()) / 86400000)); }

export default function AssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");

  async function load() {
    try { setLoading(true); setPageError(""); const r = await api.get(`/assignments/${id}`); setAssignment(r.data.assignment); }
    catch (err: any) { setPageError(err.response?.data?.message || "Failed to load assignment"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) { setError("Select a file first."); return; }
    setSubmitting(true); setMessage(""); setError("");
    try {
      const form = new FormData(); form.append("file", file);
      await api.post(`/assignments/${id}/submit`, form, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage("Assignment submitted successfully."); setFile(null); await load();
    } catch (err: any) { setError(err.response?.data?.message || "Submission failed"); }
    finally { setSubmitting(false); }
  }

  if (loading) return <AppShell><div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div></AppShell>;
  if (pageError) return (
    <AppShell>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: "1rem" }} onClick={() => navigate(-1)}>← Back</button>
      <div className="alert alert-danger">{pageError}</div>
    </AppShell>
  );
  if (!assignment) return null;

  const sub = assignment.submissions[0];
  const past = new Date(assignment.deadline) < new Date();

  return (
    <AppShell>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: "1rem" }} onClick={() => navigate(-1)}>← Back to Assignments</button>

      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-student)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {assignment.module.code} — {assignment.module.name}
        </p>
        <h1 className="page-title" style={{ marginTop: "0.25rem" }}>{assignment.title}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.25rem", alignItems: "start" }}>

        {/* Left — details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Instructions */}
          <div className="card">
            <div className="card-header"><h2 className="card-title">Instructions</h2></div>
            <div className="card-body">
              <p style={{ color: "var(--color-text-2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {assignment.description || "No additional instructions provided."}
              </p>
            </div>
          </div>

          {/* Submission */}
          <div className="card">
            <div className="card-header"><h2 className="card-title">Your Submission</h2></div>
            <div className="card-body">
              {sub ? (
                <div>
                  <div className={`alert ${sub.status === "LATE" ? "alert-warning" : "alert-success"}`} style={{ marginBottom: "1rem" }}>
                    {sub.status === "LATE" ? "⚠️ Submitted late" : "✅ Submitted on time"}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-3)" }}>File</p>
                      <p style={{ fontSize: "0.875rem", color: "var(--color-text-2)", marginTop: "0.25rem" }}>{sub.fileName}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-3)" }}>Submitted</p>
                      <p style={{ fontSize: "0.875rem", color: "var(--color-text-2)", marginTop: "0.25rem" }}>{new Date(sub.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {past && (
                    <div className="alert alert-warning">
                      This assignment is overdue by {overdueDays(assignment.deadline)} day{overdueDays(assignment.deadline) !== 1 ? "s" : ""}. You can still submit — it will be marked as late.
                    </div>
                  )}
                  <div>
                    <label className="form-label">Upload your file <span style={{ color: "var(--color-danger)" }}>*</span></label>
                    <input
                      type="file"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
                      style={{ width: "100%", fontSize: "0.875rem", color: "var(--color-text-2)" }}
                    />
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-4)", marginTop: "0.375rem" }}>PDF, DOC, DOCX — max 10 MB</p>
                  </div>
                  {file && <p style={{ fontSize: "0.8125rem", color: "var(--color-text-3)" }}>Selected: {file.name}</p>}
                  {error && <div className="alert alert-danger">{error}</div>}
                  {message && <div className="alert alert-success">{message}</div>}
                  <button type="submit" disabled={submitting || !file} className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
                    {submitting ? "Submitting…" : past ? "Submit late" : "Submit assignment"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right — deadline sidebar */}
        <div className="card" style={{ position: "sticky", top: "1rem" }}>
          <div className="card-body">
            <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-3)", marginBottom: "0.5rem" }}>Deadline</p>
            <p style={{ fontSize: "1rem", fontWeight: 600, color: past ? "var(--color-danger)" : "var(--color-text)" }}>
              {new Date(assignment.deadline).toLocaleDateString(undefined, { dateStyle: "full" })}
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)", marginTop: "0.25rem" }}>
              {new Date(assignment.deadline).toLocaleTimeString(undefined, { timeStyle: "short" })}
            </p>
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
              {sub
                ? <span className={`badge ${sub.status === "LATE" ? "badge-yellow" : "badge-green"}`}>{sub.status === "LATE" ? "Submitted late" : "Submitted ✓"}</span>
                : past
                  ? <span className="badge badge-red">Overdue</span>
                  : <span className="badge badge-gray">Not submitted</span>
              }
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
