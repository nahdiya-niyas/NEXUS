import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";

interface PrivateFile { id: number; fileName: string; uploadedAt: string; }

export default function PrivateFiles() {
  const [files, setFiles] = useState<PrivateFile[]>([]);
  const [selected, setSelected] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<PrivateFile | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<number | null>(null);

  function flash(msg: string) {
    setMessage(msg); setError("");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setMessage(""), 2500);
  }

  useEffect(() => {
    loadFiles();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  async function loadFiles() {
    try { setLoading(true); const r = await api.get("/private-files"); setFiles(r.data.files || []); }
    catch (err: any) { setError(err.response?.data?.message || "Failed to load files"); }
    finally { setLoading(false); }
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault(); setError("");
    if (!selected) { setError("Select a file first."); return; }
    if (selected.size > 20 * 1024 * 1024) { setError("File must be 20 MB or less."); return; }
    try {
      setUploading(true);
      const form = new FormData(); form.append("file", selected);
      await api.post("/private-files", form, { headers: { "Content-Type": "multipart/form-data" } });
      setSelected(null);
      if (inputRef.current) inputRef.current.value = "";
      await loadFiles();
      flash("File uploaded.");
    } catch (err: any) { setError(err.response?.data?.message || "Upload failed"); }
    finally { setUploading(false); }
  }

  async function handleDownload(file: PrivateFile) {
    try {
      const res = await api.get(`/private-files/${file.id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a"); a.href = url; a.download = file.fileName;
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    } catch { setError("Download failed."); }
  }

  async function handleDelete() {
    if (!deleteModal) return;
    try {
      setDeletingId(deleteModal.id);
      await api.delete(`/private-files/${deleteModal.id}`);
      setFiles(prev => prev.filter(f => f.id !== deleteModal.id));
      setDeleteModal(null);
      flash("File deleted.");
    } catch (err: any) { setError(err.response?.data?.message || "Delete failed"); }
    finally { setDeletingId(null); }
  }

  return (
    <AppShell>
      <PageHeader title="Private Files" description="Your personal files — only you can see these." />

      {/* Upload */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-header"><h2 className="card-title">Upload a file</h2></div>
        <div className="card-body">
          <form onSubmit={handleUpload} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              ref={inputRef}
              type="file"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSelected(e.target.files?.[0] || null)}
              style={{ fontSize: "0.875rem", color: "var(--color-text-2)", flex: "1 1 200px" }}
            />
            <button type="submit" disabled={uploading || !selected} className="btn btn-primary">
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </form>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-4)", marginTop: "0.5rem" }}>Max size: 20 MB</p>
          {message && <div className="alert alert-success" style={{ marginTop: "0.75rem" }}>{message}</div>}
          {error && <div className="alert alert-danger" style={{ marginTop: "0.75rem" }}>{error}</div>}
        </div>
      </div>

      {/* File list */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">My files</h2>
          <span className="badge badge-gray">{files.length}</span>
        </div>
        {loading ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--color-text-3)" }}>Loading…</div>
        ) : files.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <p className="empty-title">No files yet</p>
            <p className="empty-description">Upload your first file using the form above.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>File name</th>
                <th style={{ width: "160px" }}>Uploaded</th>
                <th style={{ width: "140px" }}></th>
              </tr>
            </thead>
            <tbody>
              {files.map(f => (
                <tr key={f.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <span style={{ fontSize: "1.125rem" }}>📄</span>
                      <span style={{ fontWeight: 500, color: "var(--color-text)" }}>{f.fileName}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--color-text-3)", fontSize: "0.8125rem" }}>{new Date(f.uploadedAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(f)}>Download</button>
                      <button className="btn btn-sm" style={{ background: "var(--color-danger-light)", color: "var(--color-danger)", border: "1px solid var(--color-danger-border)" }} onClick={() => setDeleteModal(f)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete modal */}
      {deleteModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 style={{ fontWeight: 700, color: "var(--color-text)" }}>Delete file?</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)", marginTop: "0.5rem" }}>
              <strong>"{deleteModal.fileName}"</strong> will be permanently deleted.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.625rem", marginTop: "1.5rem" }}>
              <button className="btn btn-secondary" disabled={deletingId !== null} onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={deletingId !== null} onClick={handleDelete}>{deletingId ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
