import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { api } from "../services/api";
import Navbar from "../components/Navbar";

interface Lecturer {
  id: number;
  name: string;
  email: string;
}

interface Assignment {
  id: number;
  title: string;
  description?: string | null;
  deadline: string;
}

interface Module {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  credits: number;
  lecturer?: Lecturer | null;
  assignments: Assignment[];
}

interface Resource {
  id: number;
  title: string;
  fileName: string;
  filePath: string;
  createdAt: string;
}

function ModuleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [module, setModule] = useState<Module | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadModule = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/modules/${id}`);
        setModule(response.data.module);
        setEnrolled(response.data.enrolled);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to load module");
      } finally {
        setLoading(false);
      }
    };
    loadModule();
  }, [id]);

  useEffect(() => {
    if (!enrolled || !id) { setResources([]); return; }
    const loadResources = async () => {
      try {
        setResourceLoading(true);
        const response = await api.get(`/resources/module/${id}`);
        setResources(response.data.resources || []);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to load resources");
      } finally {
        setResourceLoading(false);
      }
    };
    loadResources();
  }, [enrolled, id]);

  const getFileUrl = (filePath: string) => {
    if (filePath.startsWith("http")) return filePath;
    return `http://localhost:3001${filePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <p className="text-slate-400">Loading module...</p>
        </div>
      </div>
    );
  }

  if (error && !module) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 py-12">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to Modules
          </button>
          <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!module) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* ← BACK BUTTON */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          ← Back to Modules
        </button>

        {/* PAGE HEADER */}
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
            {module.code}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">{module.name}</h1>
          {module.description && (
            <p className="mt-2 max-w-2xl text-slate-400">{module.description}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300">
              📚 {module.credits} Credits
            </span>
            {module.lecturer && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300">
                👤 {module.lecturer.name}
              </span>
            )}
          </div>
        </div>

        {/* NOT ENROLLED */}
        {!enrolled ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8">
            <h3 className="text-xl font-semibold text-amber-400">
              You are not enrolled in this module.
            </h3>
            <p className="mt-3 text-slate-300">
              You need to enroll using the module code provided by your lecturer.
            </p>
            <Link
              to="/modules"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium hover:bg-blue-500"
            >
              Go to Modules
            </Link>
          </div>
        ) : (
          <>
            {/* RESOURCES */}
            <section className="mb-10">
              <h2 className="mb-1 text-2xl font-semibold">Resources</h2>
              <p className="mb-5 text-sm text-slate-400">Learning materials uploaded by your lecturer.</p>

              {resourceLoading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
                  <p className="text-slate-400">Loading resources...</p>
                </div>
              ) : resources.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
                  <p className="text-slate-400">No resources uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">{resource.title}</p>
                        <p className="mt-1 truncate text-sm text-slate-400">{resource.fileName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Uploaded {new Date(resource.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <a
                        href={getFileUrl(resource.filePath)}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-sm hover:bg-blue-500"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ASSIGNMENTS */}
            <section>
              <h2 className="mb-1 text-2xl font-semibold">Assignments</h2>
              <p className="mb-5 text-sm text-slate-400">All assignments for this module.</p>

              {module.assignments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
                  <p className="text-slate-400">No assignments posted yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {module.assignments
                    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())
                    .map((assignment) => {
                      const isPast = new Date(assignment.deadline).getTime() < Date.now();
                      return (
                        <Link
                          key={assignment.id}
                          to={`/assignments/${assignment.id}`}
                          className="block rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-slate-200">{assignment.title}</h3>
                                {isPast ? (
                                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-500">Past</span>
                                ) : (
                                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">Upcoming</span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-slate-400">
                                {assignment.description || "No description."}
                              </p>
                            </div>
                            <div className="shrink-0 text-left md:text-right">
                              <p className="text-xs text-slate-500">Deadline</p>
                              <p className={`mt-1 text-sm ${isPast ? "text-slate-500" : "text-amber-400"}`}>
                                {new Date(assignment.deadline).toLocaleString()}
                              </p>
                              <p className="mt-2 text-xs text-blue-400">View →</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              )}
            </section>
          </>
        )}

      </main>
    </div>
  );
}

export default ModuleDetails;
