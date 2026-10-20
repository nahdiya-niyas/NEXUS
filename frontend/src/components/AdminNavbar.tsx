import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function confirmLogout() {
    setShowLogoutModal(false);
    logout();
    navigate("/login");
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex h-12 items-center px-1 text-sm font-medium whitespace-nowrap transition ${
      isActive ? "text-white" : "text-slate-400 hover:text-white"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6">

          {/* TOP BAR */}
          <div className="min-h-20 flex items-center justify-between gap-6">

            {/* LOGO */}
            <Link to="/admin-dashboard" className="shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
                  A
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white">NEXUS</h1>
                  <p className="text-xs text-violet-400">Admin Panel</p>
                </div>
              </div>
            </Link>

            {/* ACCOUNT DROPDOWN */}
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-800"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-700 bg-violet-900/50 text-sm font-semibold text-violet-300">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium text-slate-200">{user?.name || "Admin"}</p>
                  <p className="text-xs text-violet-400">Administrator</p>
                </div>
                <span className={`text-xs text-slate-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}>▼</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
                  <div className="border-b border-slate-800 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-900/50 font-semibold text-violet-300">
                        {user?.name?.charAt(0).toUpperCase() || "A"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{user?.name}</p>
                        <p className="truncate text-xs text-slate-400">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-800 p-2">
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); setShowLogoutModal(true); }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-400 transition hover:bg-red-950/40 hover:text-red-300"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* NAV TABS */}
          <nav className="flex items-end gap-8 overflow-x-auto">
            <NavLink to="/admin-dashboard" end className={navClass}>
              {({ isActive }) => (<>Dashboard{isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-violet-500" />}</>)}
            </NavLink>
            <NavLink to="/admin/users" className={navClass}>
              {({ isActive }) => (<>Users{isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-violet-500" />}</>)}
            </NavLink>
            <NavLink to="/admin/modules" className={navClass}>
              {({ isActive }) => (<>Modules{isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-violet-500" />}</>)}
            </NavLink>
            <NavLink to="/admin/enrollments" className={navClass}>
              {({ isActive }) => (<>Enrollments{isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-violet-500" />}</>)}
            </NavLink>
            <NavLink to="/admin/reports" className={navClass}>
              {({ isActive }) => (<>Reports{isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-violet-500" />}</>)}
            </NavLink>
            <NavLink to="/admin/settings" className={navClass}>
              {({ isActive }) => (<>Settings{isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-violet-500" />}</>)}
            </NavLink>
          </nav>

        </div>
      </header>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950 text-xl">🚪</div>
            <h2 className="mt-5 text-xl font-semibold text-white">Log out of NEXUS?</h2>
            <p className="mt-2 text-sm text-slate-400">You will be signed out of the admin panel.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminNavbar;
