
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../services/api";
import PageLayout from "../components/PageLayout";

interface Module {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  credits: number;
}

function Modules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [enrolledModuleIds, setEnrolledModuleIds] =
    useState<number[]>([]);

  const [moduleCode, setModuleCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [dropping, setDropping] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showDropModal, setShowDropModal] =
    useState(false);

  const [moduleToDrop, setModuleToDrop] =
    useState<Module | null>(null);

  const loadModules = async () => {
    try {
      setLoading(true);
      setError("");

      const [modulesResponse, enrolledResponse] =
        await Promise.all([
          api.get("/modules"),
          api.get("/enrollments/my"),
        ]);

      const allModules =
        modulesResponse.data.modules || [];

      const enrollments =
        enrolledResponse.data.enrollments || [];

      setModules(allModules);

      setEnrolledModuleIds(
        enrollments.map(
          (enrollment: any) =>
            enrollment.module.id
        )
      );
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

  useEffect(() => {
    loadModules();
  }, []);

  const handleEnroll = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!moduleCode.trim()) {
      setError("Please enter a module code.");
      return;
    }

    try {
      setEnrolling(true);
      setError("");
      setMessage("");

      const response = await api.post(
        "/enrollments",
        {
          code: moduleCode.trim().toUpperCase(),
        }
      );

      setMessage(
        response.data.message ||
          "Successfully enrolled in module."
      );

      setModuleCode("");

      await loadModules();
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to enroll in module"
      );
    } finally {
      setEnrolling(false);
    }
  };

  function openDropModal(module: Module) {
    setError("");
    setMessage("");

    setModuleToDrop(module);
    setShowDropModal(true);
  }

  function closeDropModal() {
    if (dropping) {
      return;
    }

    setShowDropModal(false);
    setModuleToDrop(null);
  }

  const confirmDrop = async () => {
    if (!moduleToDrop) {
      return;
    }

    try {
      setDropping(true);
      setError("");
      setMessage("");

      await api.delete(
        `/enrollments/${moduleToDrop.id}`
      );

      setMessage(
        `${moduleToDrop.code} dropped successfully.`
      );

      setEnrolledModuleIds((currentIds) =>
        currentIds.filter(
          (id) => id !== moduleToDrop.id
        )
      );

      setShowDropModal(false);
      setModuleToDrop(null);
    } catch (error: any) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to drop module"
      );
    } finally {
      setDropping(false);
    }
  };

  if (loading) {
    return <PageLayout title="Modules" loading />;
  }

  return (
    <>
    <PageLayout
      title="Modules"
      subtitle="Student Workspace"
      description="View available modules and access the ones you are enrolled in."
    >

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

        {/* ENROLL */}

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-10">

          <h3 className="text-xl font-semibold">
            Enroll in a Module
          </h3>

          <p className="text-slate-400 text-sm mt-2 mb-5">
            Enter the module code provided by your
            lecturer.
          </p>

          <form
            onSubmit={handleEnroll}
            className="flex flex-col sm:flex-row gap-3 max-w-xl"
          >

            <input
              type="text"
              value={moduleCode}
              onChange={(event) =>
                setModuleCode(event.target.value)
              }
              placeholder="e.g. N3462"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white uppercase placeholder:text-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={enrolling}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {enrolling
                ? "Enrolling..."
                : "Enroll"}
            </button>

          </form>

        </section>

        {/* AVAILABLE MODULES */}

        <section>

          <div className="mb-5">

            <h3 className="text-2xl font-semibold">
              Available Modules
            </h3>

            <p className="text-slate-400 text-sm mt-1">
              Enter the code provided by the lecturer
              to enroll.
            </p>

          </div>

          {modules.length === 0 ? (

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

              <p className="text-slate-400">
                No modules are currently available.
              </p>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {modules.map((module) => {

                const enrolled =
                  enrolledModuleIds.includes(
                    module.id
                  );

                return (
                  <div
                    key={module.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 transition hover:border-slate-700 hover:shadow-lg"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <span className="text-sm font-semibold text-blue-400">
                        {module.code}
                      </span>

                      {enrolled && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Enrolled
                        </span>
                      )}

                    </div>

                    <h4 className="text-xl font-semibold mt-4">
                      {module.name}
                    </h4>

                    <p className="text-sm text-slate-400 mt-3 min-h-[40px]">
                      {module.description ||
                        "No description available."}
                    </p>

                    <p className="text-sm text-slate-500 mt-4">
                      Credits: {module.credits}
                    </p>

                    <div className="mt-6 flex gap-3">

                      <Link
                        to={`/modules/${module.id}`}
                        className="flex-1 text-center px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-sm font-medium"
                      >
                        View Module
                      </Link>

                      {enrolled && (
                        <button
                          type="button"
                          onClick={() =>
                            openDropModal(module)
                          }
                          className="px-4 py-2.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/20 transition text-sm"
                        >
                          Drop
                        </button>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

    </PageLayout>

      {/* DROP MODULE CONFIRMATION MODAL */}      {showDropModal && moduleToDrop && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="drop-module-title"
            className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >

            {/* ICON */}

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950 text-xl">
              ⚠️
            </div>

            {/* TITLE */}

            <h2
              id="drop-module-title"
              className="mt-5 text-xl font-semibold text-white"
            >
              Drop this module?
            </h2>

            {/* MESSAGE */}

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Are you sure you want to drop{" "}
              <span className="font-semibold text-slate-200">
                {moduleToDrop.code} —{" "}
                {moduleToDrop.name}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-slate-500">
              You will no longer be enrolled in this module.
            </p>

            {/* BUTTONS */}

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={closeDropModal}
                disabled={dropping}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDrop}
                disabled={dropping}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {dropping
                  ? "Dropping..."
                  : "Drop Module"}
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}

export default Modules;
