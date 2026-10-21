import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";

interface Assignment {
  id: number; title: string; description: string | null; deadline: string;
  module: { id: number; code: string; name: string; };
  submissions: { id: number; status: "SUBMITTED" | "LATE"; }[];
}

function daysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"upcoming" | "all">("upcoming");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/assignments");
        const all: Assignment[] = res.data.assignments || [];
        all.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        setAssignments(all);
      } catch (err: any) { setError(err.response?.data?.message || "Failed to load assignments"); }
      finally { setLoading(false); }
    })();
  }, []);

  const now = new Date();
  const visible = filter === "upcoming"
    ? assignments.filter(a => new Date(a.deadline) >= now)
    : assignments;

  return (
    <AppShell>
      <PageHeader
        title="Assignments"
        description="Track your upcoming and past assignment deadlines."
        action={
          <div style={{ display: "flex", gap: "0.25rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-lg)", padding: "0.25rem" }}>
            {(["upcoming", "all"] as const).map(f => (
              <button key={f} type="button" onClick={() => setFilter(f)}
                style={{ padding: "0.375rem 0.75rem", borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600,
                  background: filter === f ? "white" : "transparent",
                  color: filter === f ? "var(--color-text)" : "var(--color-text-3)",
                  boxShadow: filter === f ? "var(--shadow-sm)" : "none" }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <div className="card"><div style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div></div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : visible.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <p className="empty-title">{filter === "upcoming" ? "No upcoming assignments" : "No assignments yet"}</p>
            <p className="empty-description">{filter === "upcoming" ? "You're all caught up." : "Assignments will appear here once your lecturers post them."}</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Module</th>
                <th style={{ width: "150px" }}>Deadline</th>
                <th style={{ width: "110px", textAlign: "center" }}>Status</th>
                <th style={{ width: "70px" }}></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(a => {
                const sub = a.submissions[0];
                const days = daysUntil(a.deadline);
                const past = days < 0;
                return (
                  <tr key={a.id}>
                    <td>
                      <p style={{ fontWeight: 500, color: "var(--color-text)" }}>{a.title}</p>
                      {a.description && <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)", marginTop: "0.125rem" }}>{a.description.slice(0, 80)}{a.description.length > 80 ? "…" : ""}</p>}
                    </td>
                    <td><span className="badge badge-blue">{a.module.code}</span></td>
                    <td>
                      <p style={{ fontSize: "0.8125rem", color: past ? "var(--color-text-3)" : days <= 3 ? "var(--color-danger)" : "var(--color-text-2)" }}>
                        {new Date(a.deadline).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </p>
                      {!past && days <= 3 && <p style={{ fontSize: "0.6875rem", color: "var(--color-danger)", marginTop: "0.125rem" }}>{days === 0 ? "Due today" : `${days}d left`}</p>}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {sub
                        ? <span className={`badge ${sub.status === "LATE" ? "badge-yellow" : "badge-green"}`}>{sub.status === "LATE" ? "Late" : "Submitted"}</span>
                        : past
                          ? <span className="badge badge-red">Overdue</span>
                          : <span className="badge badge-gray">Pending</span>
                      }
                    </td>
                    <td><Link to={`/assignments/${a.id}`} className="btn btn-secondary btn-sm">Open</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
