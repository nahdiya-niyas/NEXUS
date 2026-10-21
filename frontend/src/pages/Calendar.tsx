import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";

interface Assignment { id: number; title: string; deadline: string; module: { id: number; code: string; name: string; }; }

export default function Calendar() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(new Date());

  useEffect(() => {
    api.get("/assignments").then(r => setAssignments(r.data.assignments || [])).catch(e => setError(e.response?.data?.message || "Failed to load")).finally(() => setLoading(false));
  }, []);

  const year = current.getFullYear();
  const month = current.getMonth();
  const monthName = current.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [firstDay, daysInMonth]);

  function assignmentsForDay(day: number) {
    return assignments.filter(a => {
      const d = new Date(a.deadline);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  function isToday(day: number) {
    const t = new Date();
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
  }

  const upcoming = assignments.filter(a => new Date(a.deadline) >= new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 6);

  return (
    <AppShell>
      <PageHeader title="Calendar" description="View assignment deadlines across the month." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "1.25rem", alignItems: "start" }}>

        {/* Calendar grid */}
        <div className="card">
          {/* Toolbar */}
          <div className="card-header">
            <h2 className="card-title">{monthName} {year}</h2>
            <div style={{ display: "flex", gap: "0.375rem" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setCurrent(new Date(year, month - 1, 1))}>‹</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setCurrent(new Date())}>Today</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setCurrent(new Date(year, month + 1, 1))}>›</button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div>
          ) : error ? (
            <div style={{ padding: "1rem" }}><div className="alert alert-danger">{error}</div></div>
          ) : (
            <div style={{ padding: "0.75rem" }}>
              {/* Weekday headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "0.25rem" }}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                  <div key={d} style={{ padding: "0.375rem 0.25rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-3)" }}>{d}</div>
                ))}
              </div>
              {/* Days */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                {cells.map((day, i) => {
                  if (!day) return <div key={`e-${i}`} style={{ minHeight: "70px" }} />;
                  const dayAssignments = assignmentsForDay(day);
                  const today = isToday(day);
                  return (
                    <div key={day} style={{
                      minHeight: "70px", borderRadius: "var(--radius-md)", padding: "0.375rem",
                      background: today ? "var(--color-student-light)" : "transparent",
                      border: today ? `1px solid var(--color-student-border)` : "1px solid transparent",
                    }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.25rem" }}>
                        <span style={{
                          fontSize: "0.8125rem", fontWeight: today ? 700 : 500,
                          color: today ? "var(--color-student)" : "var(--color-text-3)",
                          width: "1.5rem", height: "1.5rem",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          borderRadius: "9999px",
                          background: today ? "var(--color-student)" : "transparent",
                          color: today ? "white" : undefined,
                        }}>
                          {day}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        {dayAssignments.map(a => (
                          <Link key={a.id} to={`/assignments/${a.id}`} title={a.title}
                            style={{ display: "block", padding: "2px 4px", borderRadius: "3px", fontSize: "0.65rem", fontWeight: 600, background: "var(--color-danger-light)", color: "var(--color-danger)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {a.module.code}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming sidebar */}
        <div className="card" style={{ position: "sticky", top: "1rem" }}>
          <div className="card-header"><h2 className="card-title">Upcoming</h2></div>
          {upcoming.length === 0 ? (
            <div className="empty-state" style={{ padding: "1.5rem" }}>
              <p className="empty-title">No upcoming deadlines</p>
            </div>
          ) : (
            <div>
              {upcoming.map(a => {
                const days = Math.ceil((new Date(a.deadline).getTime() - Date.now()) / 86400000);
                return (
                  <Link key={a.id} to={`/assignments/${a.id}`} style={{ display: "block", padding: "0.75rem 1rem", borderBottom: "1px solid var(--color-border)", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-student)" }}>{a.module.code}</p>
                        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</p>
                        <p style={{ fontSize: "0.6875rem", color: "var(--color-text-3)", marginTop: "0.125rem" }}>{new Date(a.deadline).toLocaleDateString()}</p>
                      </div>
                      <span className={`badge ${days <= 3 ? "badge-red" : "badge-yellow"}`} style={{ flexShrink: 0, marginLeft: "0.375rem" }}>
                        {days === 0 ? "Today" : `${days}d`}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
