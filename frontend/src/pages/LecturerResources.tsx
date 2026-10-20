
import { useEffect, useState } from "react";
import LecturerNavbar from "../components/LecturerNavbar";
import { api } from "../services/api";

interface Module {
  id: number;
  code: string;
  name: string;
}

interface Resource {
  id: number;
  title: string;
  fileName: string;
  filePath: string;
  moduleId: number;
  createdAt: string;
}

function LecturerResources() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] =
    useState<number | null>(null);

  const [resources, setResources] = useState<Resource[]>(
    []
  );

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [resourceLoading, setResourceLoading] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadModules = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/lecturer/modules"
        );

        const lecturerModules =
          response.data.modules || [];

        setModules(lecturerModules);

        if (lecturerModules.length > 0) {
          setSelectedModule(
            lecturerModules[0].id
          );
        }
      } catch (error: any) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to load modules"
        );
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  useEffect(() => {
    if (!selectedModule) {
      setResources([]);
      return;
    }

    const loadResources = async () => {
      try {
        setResourceLoading(true);
        setError("");

        const response = await api.get(
          `/resources/module/${selectedModule}`
        );

        setResources(
          response.data.resources || []
        );
      } catch (error: any) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to load resources"
        );
      } finally {
        setResourceLoading(false);
      }
    };

    loadResources();
  }, [selectedModule]);

  const handleUpload = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!selectedModule) {
      setError("Please select a module.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a resource title.");
      return;
    }

    if (!file) {
      setError("Please select a file.");
      return;
    }

    try {
      setResourceLoading(true);

      const formData = new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append("file", file);

      await api.post(
        `/resources/module/${selectedModule}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setTitle("");
      setFile(null);

      const fileInput =
        document.getElementById(
          "resource-file"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      setMessage(
        "Resource uploaded successfully."
      );

      const response = await api.get(
        `/resources/module/${selectedModule}`
      );

      setResources(
        response.data.resources || []
      );
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to upload resource"
      );
    } finally {
      setResourceLoading(false);
    }
  };

  const handleDelete = async (
    resourceId: number
  ) => {
    setError("");
    setMessage("");

    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setResourceLoading(true);

      await api.delete(
        `/resources/${resourceId}`
      );

      setResources((currentResources) =>
        currentResources.filter(
          (resource) =>
            resource.id !== resourceId
        )
      );

      setMessage(
        "Resource deleted successfully."
      );
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to delete resource"
      );
    } finally {
      setResourceLoading(false);
    }
  };

  const getFileUrl = (filePath: string) => {
    if (filePath.startsWith("http")) {
      return filePath;
    }

    return `http://localhost:3001${filePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-300">
          Loading resources...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* SHARED LECTURER NAVBAR */}

      <LecturerNavbar />

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* PAGE HEADER */}

        <div className="mb-8">

          <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
            Lecturer Portal
          </p>

          <h2 className="text-4xl font-bold mt-2">
            Resources
          </h2>

          <p className="text-slate-400 mt-3">
            Upload and manage learning resources for
            your modules.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-emerald-400">
            {message}
          </div>
        )}

        {/* MODULE SELECTOR */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <label className="mb-3 block text-sm font-medium text-slate-300">
            Select Module
          </label>

          <select
            value={selectedModule ?? ""}
            onChange={(event) =>
              setSelectedModule(
                event.target.value
                  ? Number(
                      event.target.value
                    )
                  : null
              )
            }
            className="w-full max-w-xl rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
          >

            {modules.length === 0 && (
              <option value="">
                No modules available
              </option>
            )}

            {modules.map((module) => (
              <option
                key={module.id}
                value={module.id}
              >
                {module.code} — {module.name}
              </option>
            ))}

          </select>

        </section>

        {/* UPLOAD */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="mb-6 text-xl font-semibold">
            Upload Resource
          </h3>

          <form
            onSubmit={handleUpload}
            className="space-y-5"
          >

            <div>

              <label className="mb-2 block text-sm text-slate-300">
                Resource Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. Week 01 Lecture Notes"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm text-slate-300">
                Resource File
              </label>

              <input
                id="resource-file"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                onChange={(event) =>
                  setFile(
                    event.target.files?.[0] ||
                      null
                  )
                }
                className="block w-full text-sm text-slate-400 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-500"
              />

            </div>

            <button
              type="submit"
              disabled={resourceLoading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resourceLoading
                ? "Uploading..."
                : "Upload Resource"}
            </button>

          </form>

        </section>

        {/* RESOURCE LIST */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6 flex items-center justify-between">

            <div>

              <h3 className="text-xl font-semibold">
                Module Resources
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {resources.length} resource
                {resources.length !== 1
                  ? "s"
                  : ""}
              </p>

            </div>

          </div>

          {resourceLoading ? (

            <p className="text-slate-400">
              Loading resources...
            </p>

          ) : resources.length === 0 ? (

            <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center">

              <p className="text-slate-400">
                No resources uploaded for this module
                yet.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {resources.map(
                (resource) => (

                  <div
                    key={resource.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="min-w-0">

                      <h4 className="truncate font-medium text-white">
                        {resource.title}
                      </h4>

                      <p className="mt-1 truncate text-sm text-slate-400">
                        {resource.fileName}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        Uploaded{" "}
                        {new Date(
                          resource.createdAt
                        ).toLocaleString()}
                      </p>

                    </div>

                    <div className="flex shrink-0 items-center gap-3">

                      <a
                        href={getFileUrl(
                          resource.filePath
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-slate-800 px-4 py-2 text-sm transition hover:bg-slate-700"
                      >
                        Open
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            resource.id
                          )
                        }
                        disabled={resourceLoading}
                        className="rounded-lg bg-red-600/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-600/30 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default LecturerResources;
