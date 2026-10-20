
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6">

          <div className="h-20 flex items-center justify-between">

            <div>
              <Link to="/dashboard">
                <h1 className="text-2xl font-bold">
                  NEXUS
                </h1>

                <p className="text-xs text-slate-400">
                  University Academic Platform
                </p>
              </Link>
            </div>

            <nav className="flex items-center gap-6">

              <Link
                to="/dashboard"
                className="text-sm text-slate-300 hover:text-white transition"
              >
                Dashboard
              </Link>

              <Link
                to="/modules"
                className="text-sm text-slate-300 hover:text-white transition"
              >
                Modules
              </Link>

              <Link
                to="/calendar"
                className="text-sm text-slate-300 hover:text-white transition"
              >
                Calendar
              </Link>

              <Link
                to="/private-files"
                className="text-sm text-slate-300 hover:text-white transition"
              >
                Private Files
              </Link>

              <Link
                to="/assignments"
                className="text-sm text-slate-300 hover:text-white transition"
              >
                Assignments
              </Link>

              {user && (
                <span className="text-sm text-slate-400 border-l border-slate-700 pl-6">
                  {user.name}
                </span>
              )}

              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition"
              >
                Logout
              </button>

            </nav>

          </div>

        </div>
      </header>

      <main>
        <Outlet />
      </main>

    </div>
  );
}

export default Layout;
