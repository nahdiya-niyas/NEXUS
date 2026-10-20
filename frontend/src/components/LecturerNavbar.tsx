
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function LecturerNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function openLogoutConfirmation() {
    setMenuOpen(false);
    setShowLogoutModal(true);
  }

  function cancelLogout() {
    setShowLogoutModal(false);
  }

  function confirmLogout() {
    setShowLogoutModal(false);
    logout();
    navigate("/login");
  }

  const navClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `relative flex h-12 items-center px-1 text-sm font-medium whitespace-nowrap transition ${
      isActive
        ? "text-white"
        : "text-slate-400 hover:text-white"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur">

        <div className="mx-auto max-w-7xl px-6">

          {/* TOP BAR */}

          <div className="min-h-20 flex items-center justify-between gap-6">

            {/* LOGO */}

            <Link
              to="/lecturer-dashboard"
              className="shrink-0"
            >
              <h1 className="text-2xl font-bold tracking-tight text-white">
                NEXUS
              </h1>

              <p className="mt-0.5 text-xs text-slate-400">
                University Academic Platform
              </p>
            </Link>

            {/* ACCOUNT */}

            <div
              ref={menuRef}
              className="relative"
            >

              <button
                type="button"
                onClick={() =>
                  setMenuOpen(
                    (current) => !current
                  )
                }
                className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-800"
              >

                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm font-semibold text-slate-300">
                  {user?.name
                    ?.charAt(0)
                    .toUpperCase() || "L"}
                </div>

                <div className="hidden text-left sm:block">

                  <p className="text-sm font-medium text-slate-200">
                    {user?.name || "Lecturer"}
                  </p>

                  <p className="text-xs text-slate-500">
                    Lecturer
                  </p>

                </div>

                <span
                  className={`text-xs text-slate-500 transition-transform ${
                    menuOpen
                      ? "rotate-180"
                      : ""
                  }`}
                >
                  ▼
                </span>

              </button>

              {/* ACCOUNT DROPDOWN */}

              {menuOpen && (

                <div className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

                  <div className="border-b border-slate-800 px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 font-semibold text-slate-300">
                        {user?.name
                          ?.charAt(0)
                          .toUpperCase() || "L"}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate font-semibold text-white">
                          {user?.name || "Lecturer"}
                        </p>

                        <p className="truncate text-sm text-slate-400">
                          {user?.email || ""}
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="p-2">

                    <Link
                      to="/lecturer-dashboard"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    >
                      <span>👤</span>
                      <span>Account</span>
                    </Link>

                  </div>

                  <div className="border-t border-slate-800 p-2">

                    <button
                      type="button"
                      onClick={
                        openLogoutConfirmation
                      }
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

          {/* NAVIGATION */}

          <nav className="flex items-end gap-8 overflow-x-auto">

            <NavLink
              to="/lecturer-dashboard"
              end
              className={navClass}
            >
              {({ isActive }) => (
                <>
                  Dashboard

                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-500" />
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/lecturer/modules"
              className={navClass}
            >
              {({ isActive }) => (
                <>
                  My Modules

                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-500" />
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/lecturer/assignments"
              className={navClass}
            >
              {({ isActive }) => (
                <>
                  Assignments

                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-500" />
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/lecturer/resources"
              className={navClass}
            >
              {({ isActive }) => (
                <>
                  Resources

                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-500" />
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/lecturer/submissions"
              className={navClass}
            >
              {({ isActive }) => (
                <>
                  Submissions

                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-500" />
                  )}
                </>
              )}
            </NavLink>

          </nav>

        </div>

      </header>

      {/* LOGOUT CONFIRMATION */}

      {showLogoutModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lecturer-logout-title"
            className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950 text-xl">
              🚪
            </div>

            <h2
              id="lecturer-logout-title"
              className="mt-5 text-xl font-semibold text-white"
            >
              Log out of NEXUS?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Are you sure you want to log out of your
              lecturer account?
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={cancelLogout}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmLogout}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
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

export default LecturerNavbar;
