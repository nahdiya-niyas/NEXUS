import { useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

function AdminSettings() {
  const { user, login, token } = useAuth();

  // Profile
  const [name, setName] = useState(user?.name || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(""); setProfileSuccess("");
    if (!name.trim()) { setProfileError("Name cannot be empty."); return; }
    try {
      setProfileLoading(true);
      const res = await api.put("/users/me", { name: name.trim() });
      if (token && user) login(token, { ...user, name: res.data.user.name });
      setProfileSuccess("Profile updated successfully.");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(""); setPasswordSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required."); return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match."); return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters."); return;
    }
    try {
      setPasswordLoading(true);
      await api.put("/users/change-password", { currentPassword, newPassword });
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminNavbar />

      <main className="mx-auto max-w-3xl px-6 py-10">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-violet-400">Admin Panel</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Settings</h1>
          <p className="mt-2 text-slate-400">Manage your admin account settings.</p>
        </div>

        {/* ADMIN PROFILE CARD */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-violet-700 bg-violet-900/40 text-2xl font-bold text-violet-300">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{user?.name}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
              <span className="mt-1 inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-0.5 text-xs font-medium text-violet-400">
                ADMIN
              </span>
            </div>
          </div>
        </section>

        {/* EDIT NAME */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="font-semibold text-white">Profile</h2>
            <p className="mt-1 text-sm text-slate-500">Update your display name.</p>
          </div>
          <form onSubmit={handleProfileSave} className="px-6 py-6">
            <div className="max-w-sm">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>
            {profileError && <p className="mt-3 text-sm text-red-400">{profileError}</p>}
            {profileSuccess && <p className="mt-3 text-sm text-emerald-400">✅ {profileSuccess}</p>}
            <button type="submit" disabled={profileLoading}
              className="mt-4 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {profileLoading ? "Saving..." : "Save Name"}
            </button>
          </form>
        </section>

        {/* CHANGE PASSWORD */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="font-semibold text-white">Change Password</h2>
            <p className="mt-1 text-sm text-slate-500">Update your admin account password.</p>
          </div>
          <form onSubmit={handlePasswordChange} className="px-6 py-6">
            <div className="max-w-sm space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 placeholder:text-slate-600" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 placeholder:text-slate-600" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 placeholder:text-slate-600" />
              </div>
            </div>
            {passwordError && <p className="mt-3 text-sm text-red-400">{passwordError}</p>}
            {passwordSuccess && <p className="mt-3 text-sm text-emerald-400">✅ {passwordSuccess}</p>}
            <button type="submit" disabled={passwordLoading}
              className="mt-5 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {passwordLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </section>

        {/* PLATFORM INFO */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="font-semibold text-white">Platform Info</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {[
              { label: "Platform Name", value: "NEXUS — University Academic Platform" },
              { label: "Version", value: "1.0.0" },
              { label: "Your Role", value: "ADMINISTRATOR" },
              { label: "Account Email", value: user?.email || "" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between px-6 py-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="text-sm font-medium text-slate-200">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

export default AdminSettings;
