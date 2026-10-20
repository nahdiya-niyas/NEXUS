
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { api } from "../services/api";
import PageLayout from "../components/PageLayout";

interface PrivateFile {
  id: number;
  fileName: string;
  uploadedAt: string;
}

function PrivateFiles() {
  const [files, setFiles] = useState<PrivateFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] =
    useState<PrivateFile | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageTimerRef = useRef<number | null>(null);

  function showSuccessMessage(text: string) {
    setError("");
    setMessage(text);

    if (messageTimerRef.current) {
      window.clearTimeout(messageTimerRef.current);
    }

    messageTimerRef.current = window.setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  function clearMessages() {
    setMessage("");
    setError("");

    if (messageTimerRef.current) {
      window.clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }
  }

  useEffect(() => {
    loadFiles();

    return () => {
      if (messageTimerRef.current) {
        window.clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  async function loadFiles() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/private-files");

      setFiles(response.data.files || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to load your private files."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);
    clearMessages();
  }

  async function handleUpload(event: FormEvent) {
    event.preventDefault();

    clearMessages();

    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("File size must be 20 MB or less.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("file", selectedFile);

      await api.post("/private-files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadFiles();

      showSuccessMessage("File uploaded successfully.");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to upload the file."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(file: PrivateFile) {
    clearMessages();

    try {
      const response = await api.get(
        `/private-files/${file.id}/download`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = file.fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to download the file."
      );
    }
  }

  function openDeleteModal(file: PrivateFile) {
    clearMessages();

    setFileToDelete(file);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    if (deletingId !== null) {
      return;
    }

    setShowDeleteModal(false);
    setFileToDelete(null);
  }

  async function confirmDelete() {
    if (!fileToDelete) {
      return;
    }

    clearMessages();

    try {
      setDeletingId(fileToDelete.id);

      await api.delete(
        `/private-files/${fileToDelete.id}`
      );

      setFiles((currentFiles) =>
        currentFiles.filter(
          (file) => file.id !== fileToDelete.id
        )
      );

      setShowDeleteModal(false);
      setFileToDelete(null);

      showSuccessMessage("File deleted successfully.");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to delete the file."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
    <PageLayout
      title="Private Files"
      subtitle="Student Workspace"
      description="Store and manage your personal academic documents."
    >

        {/* PRIVACY NOTICE */}

        <div className="mb-8 rounded-2xl border border-slate-700 bg-slate-900 p-5">

          <div className="flex gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-lg">
              🔒
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Your files are private
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Files uploaded here are visible only to you.
                Other students, lecturers, and administrators
                cannot access your private files.
              </p>
            </div>

          </div>

        </div>

        {/* UPLOAD */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

          <h3 className="text-lg font-semibold text-white">
            Upload a file
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Maximum file size: 20 MB
          </p>

          <form
            onSubmit={handleUpload}
            className="mt-5"
          >

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="block w-full rounded-lg border border-slate-700 bg-slate-950 text-sm text-slate-300 file:mr-4 file:border-0 file:bg-slate-800 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-slate-200 hover:file:bg-slate-700"
              />

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {uploading
                  ? "Uploading..."
                  : "Upload File"}
              </button>

            </div>

          </form>

          {message && (
            <div className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

        </section>

        {/* FILES */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">

          <div className="border-b border-slate-800 px-6 py-5">
            <h3 className="text-lg font-semibold text-white">
              My Files
            </h3>
          </div>

          {loading ? (

            <div className="px-6 py-10 text-center text-sm text-slate-400">
              Loading your files...
            </div>

          ) : files.length === 0 ? (

            <div className="px-6 py-12 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl">
                📁
              </div>

              <h4 className="font-semibold text-slate-200">
                No private files yet
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                Upload your first document using the form above.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-800">

              {files.map((file) => (

                <div
                  key={file.id}
                  className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between"
                >

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xl">
                      📄
                    </div>

                    <div className="min-w-0">

                      <p className="truncate font-medium text-slate-200">
                        {file.fileName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Uploaded{" "}
                        {new Date(
                          file.uploadedAt
                        ).toLocaleString()}
                      </p>

                    </div>

                  </div>

                  <div className="flex shrink-0 gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        handleDownload(file)
                      }
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    >
                      Download
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openDeleteModal(file)
                      }
                      className="rounded-lg border border-red-900 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-950/50 hover:text-red-300"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

    </PageLayout>

      {/* DELETE MODAL */}

      {showDeleteModal && fileToDelete && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

          <div
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-950 text-xl">
                ⚠️
              </div>

              <div className="min-w-0">

                <h3
                  id="delete-dialog-title"
                  className="text-lg font-semibold text-white"
                >
                  Delete file?
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-200">
                    "{fileToDelete.fileName}"
                  </span>
                  ?
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  This action cannot be undone.
                </p>

              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deletingId !== null}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId !== null}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId !== null
                  ? "Deleting..."
                  : "Delete File"}
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}

export default PrivateFiles;
