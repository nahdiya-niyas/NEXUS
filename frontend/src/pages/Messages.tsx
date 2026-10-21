import { FormEvent, useState } from "react";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";

export default function Messages() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError("");
    if (!email.trim()) { setError("Enter the lecturer's email."); return; }
    if (!subject.trim()) { setError("Enter a subject."); return; }
    if (!message.trim()) { setError("Write your message."); return; }
    window.location.href = `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(message.trim())}`;
  }

  return (
    <AppShell>
      <PageHeader title="Message a Lecturer" description="Contact your lecturer about assignments, modules, or academic questions." />

      <div style={{ maxWidth: "640px" }}>
        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="form-label">Lecturer email <span style={{ color: "var(--color-danger)" }}>*</span></label>
                <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="lecturer@university.edu" autoComplete="off" />
              </div>
              <div>
                <label className="form-label">Subject <span style={{ color: "var(--color-danger)" }}>*</span></label>
                <input type="text" className="form-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Question about Assignment 1" />
              </div>
              <div>
                <label className="form-label">Message <span style={{ color: "var(--color-danger)" }}>*</span></label>
                <textarea className="form-textarea form-input" rows={7} value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message here…" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Open email app →</button>
            </form>
          </div>
        </div>
        <div className="alert alert-info" style={{ marginTop: "0.875rem" }}>
          This will open your email app with the message pre-filled. You'll need to send it from your email client.
        </div>
      </div>
    </AppShell>
  );
}
