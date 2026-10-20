import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LecturerNavbar from "../components/LecturerNavbar";
import { api } from "../services/api";

interface Module {
  id: number;
  code: string;
  name: string;
}

export default function CreateLecturerAssignment() {
  const navigate = useNavigate();

  const [modules, setModules] = useState<Module[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingModules, setLoadingModules] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const response = await api.get("/lecturer/modules");

      setModules(response.data.modules);
    } catch (error) {
      console.error(error);

      setError("Failed to load your modules.");
    } finally {
      setLoadingModules(false);
    }
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");

    if (!title || !moduleId || !deadline) {
      setError(
        "Please fill in the title, module and deadline."
      );

      return;
    }

    if (!file) {
      setError(
        "Please upload the assignment document."
      );

      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only PDF, DOC and DOCX files are allowed."
      );

      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError(
        "The assignment document must be 20 MB or smaller."
      );

      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("deadline", deadline);
      formData.append("moduleId", moduleId);
      formData.append("file", file);

      await api.post(
        "/lecturer/assignments",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      navigate("/lecturer/assignments");
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Failed to create assignment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <nav className="border-b border-slate-800 bg-slate-900">

        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link
            to="/lecturer-dashboard"
            className="text-2xl font-bold"
          >
            NEXUS
          </Link>

          <Link
            to="/lecturer/assignments"
            className="text-slate-300 hover:text-white"
          >
            ← Back to Assignments
          </Link>

        </div>

      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-bold">
          Create Assignment
        </h1>

        <p className="text-slate-400 mt-2 mb-8">
          Create an assignment and upload the document
          students need to complete.
        </p>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6"
        >

          <div>

            <label className="block text-sm text-slate-300 mb-2">
              Assignment title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Linux Administration Lab 02"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
            />

          </div>

          <div>

            <label className="block text-sm text-slate-300 mb-2">
              Module
            </label>

            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              disabled={loadingModules}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
            >

              <option value="">
                {loadingModules
                  ? "Loading modules..."
                  : "Select a module"}
              </option>

              {modules.map((module) => (
                <option
                  key={module.id}
                  value={module.id}
                >
                  {module.code} — {module.name}
                </option>
              ))}

            </select>

          </div>

          <div>

            <label className="block text-sm text-slate-300 mb-2">
              Instructions
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={5}
              placeholder="Enter assignment instructions..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 resize-none"
            />

          </div>

          <div>

            <label className="block text-sm text-slate-300 mb-2">
              Deadline
            </label>

            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) =>
                setDeadline(e.target.value)
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
            />

          </div>

          <div>

            <label className="block text-sm text-slate-300 mb-2">
              Assignment document
            </label>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                setFile(e.target.files?.[0] || null)
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-300"
            />

            <p className="text-xs text-slate-500 mt-2">
              Supported formats: PDF, DOC, DOCX. Maximum
              size: 20 MB.
            </p>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg py-3 font-semibold"
          >
            {loading
              ? "Creating assignment..."
              : "Create Assignment"}
          </button>

        </form>

      </main>

    </div>
  );
}