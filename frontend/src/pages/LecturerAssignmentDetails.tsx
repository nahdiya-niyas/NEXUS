import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import AppShell from "../components/AppShell";
import StatCard from "../components/StatCard";

interface Submission { id: number; fileName: string; filePath: string; submittedAt: string; status: "SUBMITTED" | "LATE"; student: { id: number; name: string; email: string; }; }
interface Assignment { id: number; title: string; description: string | null; deadline: string; fileName: string | null; filePath: string | null; module: { id: number; code: string; name: string; }; submissions: Submission[]; }

export default function LecturerAssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) api.get(`/lecturer/assignments/${id}`).then(r => setAssignment(r.data.assignment)).catch(e => setError(e?.response?.data?.message || "Failed to load")).finally(() => setLoading(false));
  }, [id]);

  async function downloadSubmission(submissionId: number, fileName: string) {
    try {
      const res = await api.get(`/lecturer/submissions/${submissionId}/file`, { responseType: "blob" });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a"); a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    } catch { alert("Download failed."); }
  }

  if (loading) return <AppShell><div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div></AppShell>;
  if (error || !assignment) return (
    <AppShell>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: "1rem" }} onClick={() => navigate(-1)}>← Back</button>
      <div className="alert alert-danger">{error || "Assignment not found"}</div>
    </AppShell>
  );

  const onTime = assignment.submissions.filter(s => s.status === "SUBMITTED").length;
  const late = assignment.submissions.filter(s => s.status === "LATE").length;

  return (
    <AppShell>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: "1rem" }} onClick={() => navigate(-1)}>← Back to Assignments</button>

      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-lecturer)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{assignment.module.code} — {assignment.module.name}</p>
        <h1 className="page-title" style={{ marginTop: "0.25rem" }}>{assignment.title}</h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.25rem" }}>
        <StatCard label="Total Submissions" value={assignment.submissions.length} icon="📥" />
        <StatCard label="On Time" value={onTime} icon="✅" accent="var(--color-success)" />
        <StatCard label="Late" value={late} icon="⚠️" accent="var(--color-warning)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.25rem", alignItems: "start" }}>

        {/* Submissions table */}
        <div className="card">
          <div className="card-header"><h2 className="card-title">Student Submissions</h2></div>
          {assignment.submissions.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><p className="empty-title">No submissions yet</p></div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Student</th><th style={{ width: "130px" }}>Submitted</th><th style={{ width: "90px", textAlign: "center" }}>Status</th><th style={{ width: "130px" }}>File</th><th style={{ width: "110px" }}></th></tr></thead>
              <tbody>
                {assignment.submissions.map(s => (
                  <tr key={s.id}>
                    <td>
                      <p style={{ fontWeight: 500, color: "var(--color-text)" }}>{s.student.name}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>{s.student.email}</p>
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--color-text-3)" }}>{new Date(s.submittedAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`badge ${s.status === "LATE" ? "badge-yellow" : "badge-green"}`}>{s.status === "LATE" ? "Late" : "On time"}</span>
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--color-text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "130px" }}>{s.fileName}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => downloadSubmission(s.id, s.fileName)}>Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Details sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "1rem" }}>
          <div className="card">
            <div className="card-header"><h2 className="card-title">Details</h2></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-3)" }}>Deadline</p>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text)", marginTop: "0.25rem" }}>{new Date(assignment.deadline).toLocaleString()}</p>
              </div>
              {assignment.description && (
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-3)" }}>Instructions</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-2)", marginTop: "0.25rem", lineHeight: 1.6 }}>{assignment.description}</p>
                </div>
              )}
              {assignment.fileName && (
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-3)", marginBottom: "0.375rem" }}>Assignment Document</p>
                  <a href={`http://localhost:3001${assignment.filePath}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Open {assignment.fileName}</a>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
