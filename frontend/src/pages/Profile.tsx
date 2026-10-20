import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

interface Module {
  id: number;
  code: string;
  name: string;
  credits: number;
}

interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "LECTURER" | "ADMIN";
  createdAt: string;
}

interface DashboardData {
  profile: ProfileData;
  enrolledModules: Module[];
}

function Profile() {
  const { user, login, token } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit name state
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState("");
  const [nameError, setNameError] = useState("");

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/dashboard");
      setDashboard(response.data);
      setNameInput(response.data.profile.name);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveName() {
    if (!nameInput.trim()) {
      setNameError("Name cannot be empty.");
      return;
    }
    try {
      setNameLoading(true);
      setNameError("");
      setNameSuccess("");
      const response = await api.put("/users/me", { name: nameInput.trim() });
      // Update dashboard state
      setDashboard((prev) =>
        prev ? { ...prev, profile: { ...prev.profile, name: response.data.user.name } } : prev
      );
      // Update auth context so navbar name updates too
      if (token && user) {
        login(token, { ...user, name: response.data.user.name });
      }
      setNameSuccess("Name updated successfully.");
      setEditingName(false);
    } catch (err: any) {
      setNameError(err.response?.data?.message || "Failed to update name.");
    } finally {
      setNameLoading(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    try {
      setPasswordLoading(true);
      setPasswordError("");
      setPasswordSuccess("");
      await api.put("/users/change-password", { currentPassword, newPassword });
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-300">Loading profile...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <main className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-8 text-center">
            <h1 className="text-xl font-semibold">Unable to load profile</h1>
            <p className="mt-3 text-red-400">{error || "Profile unavailable"}</p>
            <button
              type="button"
              onClick={loadProfile}
              className="mt-5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* PAGE HEADER */}
        <div className="mb-8">
          <p className="font-medium text-blue-400">Account</p>
          <h1 className="mt-2 text-4xl font-bold">My Profile</h1>
          <p className="mt-2 text-slate-400">
            Manage your personal details and account settings.
          </p>
        </div>

        {/* AVATAR + NAME */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-3xl font-bold text-slate-300">
              {dashboard.profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-semibold text-white">
                {dashboard.profile.name}
              </h2>
              <p className="mt-1 text-slate-400">{dashboard.profile.email}</p>
              <span className="mt-3 inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                {dashboard.profile.role}
              </span>
            </div>
          </div>
        </section>

        {/* ACCOUNT INFORMATION */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
            <h3 className="text-lg font-semibold">Account Information</h3>
            {!editingName && (
              <button
                type="button"
                onClick={() => {
                  setEditingName(true);
                  setNameError("");
                  setNameSuccess("");
                  setNameInput(dashboard.profile.name);
                }}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                ✏️ Edit Name
              </button>
            )}
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-2">

            {/* NAME FIELD */}
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Full Name</p>
              {editingName ? (
                <div className="mt-2 flex flex-col gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                    placeholder="Enter your name"
                    autoFocus
                  />
                  {nameError && (
                    <p className="text-xs text-red-400">{nameError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveName}
                      disabled={nameLoading}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {nameLoading ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingName(false);
                        setNameError("");
                      }}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-base text-slate-200">{dashboard.profile.name}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
              <p className="mt-2 break-all text-base text-slate-200">
                {dashboard.profile.email}
              </p>
            </div>

            {/* ROLE */}
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
              <p className="mt-2 text-base text-slate-200">{dashboard.profile.role}</p>
            </div>

            {/* JOINED */}
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Account Created</p>
              <p className="mt-2 text-base text-slate-200">
                {formatDate(dashboard.profile.createdAt)}
              </p>
            </div>

          </div>

          {/* NAME SAVE SUCCESS */}
          {nameSuccess && (
            <div className="mx-6 mb-6 rounded-lg border border-green-500/20 bg-green-950/30 px-4 py-3 text-sm text-green-400">
              ✅ {nameSuccess}
            </div>
          )}
        </section>

        {/* CHANGE PASSWORD */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
            <div>
              <h3 className="text-lg font-semibold">Password</h3>
              <p className="mt-1 text-sm text-slate-500">
                Update your account password.
              </p>
            </div>
            {!showPasswordForm && (
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(true);
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                🔑 Change Password
              </button>
            )}
          </div>

          {showPasswordForm ? (
            <div className="px-6 py-6 flex flex-col gap-4 max-w-md">
              <div>
                <label className="text-xs uppercase tracking-wide text-slate-500">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-slate-500">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-slate-500">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  placeholder="Repeat new password"
                />
              </div>

              {passwordError && (
                <p className="text-sm text-red-400">{passwordError}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {passwordLoading ? "Saving..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordError("");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="px-6 py-5">
              {passwordSuccess ? (
                <p className="text-sm text-green-400">✅ {passwordSuccess}</p>
              ) : (
                <p className="text-sm text-slate-500">
                  Click "Change Password" to update your password.
                </p>
              )}
            </div>
          )}
        </section>

        {/* ENROLLED MODULES */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
          <div className="border-b border-slate-800 px-6 py-5">
            <h3 className="text-lg font-semibold">Enrolled Modules</h3>
            <p className="mt-1 text-sm text-slate-500">
              Modules currently linked to your account.
            </p>
          </div>

          {dashboard.enrolledModules.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-slate-500">You are not enrolled in any modules.</p>
              <Link
                to="/modules"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium hover:bg-blue-700"
              >
                Browse Modules
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {dashboard.enrolledModules.map((module) => (
                <Link
                  key={module.id}
                  to={`/modules/${module.id}`}
                  className="flex items-center justify-between px-6 py-5 transition hover:bg-slate-800/50"
                >
                  <div>
                    <p className="font-semibold text-blue-400">{module.code}</p>
                    <p className="mt-1 text-sm text-slate-300">{module.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                      {module.credits} Credits
                    </span>
                    <span className="text-slate-600 text-sm">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* MESSAGE LECTURER */}
        <section className="rounded-2xl border border-blue-900/50 bg-blue-950/20 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-blue-200">Need to contact a lecturer?</h3>
              <p className="mt-1 text-sm text-blue-400/80">
                Send a message about your academic work.
              </p>
            </div>
            <Link
              to="/messages"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Message Lecturer
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Profile;
