import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

interface Breadcrumb {
  label: string;
  to?: string;
}

interface PageLayoutProps {
  /** Page title shown as the large heading */
  title: string;
  /** Small label shown above the title in blue */
  subtitle?: string;
  /** Short description shown below the title */
  description?: string;
  /** Breadcrumb trail. Last item is the current page (no link needed). */
  breadcrumbs?: Breadcrumb[];
  /** Optional content to render on the right side of the header (e.g. a button) */
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  /** Show a loading skeleton instead of children */
  loading?: boolean;
  /** Show a full-page error state */
  error?: string;
  onRetry?: () => void;
}

export default function PageLayout({
  title,
  subtitle,
  description,
  breadcrumbs,
  headerAction,
  children,
  loading,
  error,
  onRetry,
}: PageLayoutProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <main className="mx-auto max-w-7xl px-6 py-10">
          {/* Breadcrumb skeleton */}
          <div className="mb-6 h-4 w-32 rounded bg-slate-800 animate-pulse" />
          {/* Title skeleton */}
          <div className="mb-2 h-8 w-64 rounded bg-slate-800 animate-pulse" />
          <div className="mb-10 h-4 w-80 rounded bg-slate-700 animate-pulse" />
          {/* Card skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <main className="mx-auto max-w-7xl px-6 py-20 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-950/20 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-950 text-2xl">
              ⚠️
            </div>
            <h2 className="text-xl font-semibold text-white">
              Something went wrong
            </h2>
            <p className="mt-3 text-sm text-red-400">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Go Back
              </button>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* BREADCRUMBS */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <span key={index} className="flex items-center gap-2">
                  {index > 0 && <span className="text-slate-700">/</span>}
                  {!isLast && crumb.to ? (
                    <button
                      type="button"
                      onClick={() => navigate(crumb.to!)}
                      className="text-blue-400 hover:text-blue-300 transition"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className={isLast ? "text-slate-300" : "text-slate-500"}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        )}

        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {subtitle && (
              <p className="mb-2 text-sm font-medium text-blue-400 uppercase tracking-wide">
                {subtitle}
              </p>
            )}
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            {description && (
              <p className="mt-2 text-slate-400 max-w-2xl">{description}</p>
            )}
          </div>
          {headerAction && (
            <div className="shrink-0">{headerAction}</div>
          )}
        </div>

        {/* PAGE CONTENT */}
        {children}

      </main>
    </div>
  );
}
