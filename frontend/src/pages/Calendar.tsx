
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../services/api";
import PageLayout from "../components/PageLayout";

interface Assignment {
  id: number;
  title: string;
  deadline: string;
  module: {
    id: number;
    code: string;
    name: string;
  };
}

function Calendar() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/assignments");

      setAssignments(response.data.assignments || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to load calendar data."
      );
    } finally {
      setLoading(false);
    }
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [firstDayOfMonth, daysInMonth]);

  function goToPreviousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function goToNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  function getAssignmentsForDay(day: number) {
    return assignments.filter((assignment) => {
      const deadline = new Date(assignment.deadline);

      return (
        deadline.getFullYear() === year &&
        deadline.getMonth() === month &&
        deadline.getDate() === day
      );
    });
  }

  function isToday(day: number) {
    const today = new Date();

    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <PageLayout
      title="Calendar"
      subtitle="Student Workspace"
      description="View your assignment deadlines and academic dates."
    >

        {/* CALENDAR */}

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">

          {/* TOOLBAR */}

          <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-xl font-semibold text-white">
                {monthName} {year}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Assignment deadlines are shown on their due dates.
              </p>
            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={goToPreviousMonth}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                ←
              </button>

              <button
                type="button"
                onClick={goToToday}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Today
              </button>

              <button
                type="button"
                onClick={goToNextMonth}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                →
              </button>

            </div>
          </div>

          {/* LOADING */}

          {loading && (
            <div className="px-6 py-12 text-center text-sm text-slate-400">
              Loading calendar...
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="m-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* CALENDAR GRID */}

          {!loading && !error && (
            <div className="p-4 sm:p-6">

              {/* WEEKDAYS */}

              <div className="grid grid-cols-7 border-b border-slate-800">

                {[
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                ].map((day) => (
                  <div
                    key={day}
                    className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {day}
                  </div>
                ))}

              </div>

              {/* DAYS */}

              <div className="grid grid-cols-7">

                {calendarDays.map((day, index) => {

                  if (day === null) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="min-h-32 border-b border-r border-slate-800 bg-slate-950/40"
                      />
                    );
                  }

                  const dayAssignments =
                    getAssignmentsForDay(day);

                  return (
                    <div
                      key={day}
                      className="min-h-32 border-b border-r border-slate-800 bg-slate-900/60 p-2 transition hover:bg-slate-800/60"
                    >

                      {/* DAY NUMBER */}

                      <div className="mb-2 flex justify-end">

                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                            isToday(day)
                              ? "bg-white text-slate-950"
                              : "text-slate-400"
                          }`}
                        >
                          {day}
                        </span>

                      </div>

                      {/* ASSIGNMENTS */}

                      <div className="space-y-2">

                        {dayAssignments.map(
                          (assignment) => (
                            <Link
                              key={assignment.id}
                              to={`/assignments/${assignment.id}`}
                              className="block rounded-lg border border-slate-700 bg-slate-800/80 p-2 transition hover:border-blue-500 hover:bg-slate-700"
                            >

                              <p className="truncate text-xs font-semibold text-white">
                                {assignment.title}
                              </p>

                              <p className="mt-1 truncate text-[11px] text-blue-400">
                                {assignment.module.code}
                              </p>

                              <p className="mt-1 text-[11px] text-slate-500">
                                {formatTime(
                                  assignment.deadline
                                )}
                              </p>

                            </Link>
                          )
                        )}

                      </div>

                    </div>
                  );
                })}

              </div>

            </div>
          )}

        </section>

        {/* UPCOMING DEADLINES */}

        {!loading && !error && (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">

            <div className="border-b border-slate-800 px-6 py-5">

              <h3 className="text-lg font-semibold text-white">
                Upcoming Deadlines
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your next assignment deadlines.
              </p>

            </div>

            {assignments.filter(
              (assignment) =>
                new Date(assignment.deadline) >= new Date()
            ).length === 0 ? (

              <div className="px-6 py-10 text-center text-sm text-slate-500">
                No upcoming deadlines.
              </div>

            ) : (

              <div className="divide-y divide-slate-800">

                {assignments
                  .filter(
                    (assignment) =>
                      new Date(assignment.deadline) >=
                      new Date()
                  )
                  .sort(
                    (a, b) =>
                      new Date(a.deadline).getTime() -
                      new Date(b.deadline).getTime()
                  )
                  .slice(0, 5)
                  .map((assignment) => (

                    <Link
                      key={assignment.id}
                      to={`/assignments/${assignment.id}`}
                      className="flex flex-col gap-2 px-6 py-5 transition hover:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div>

                        <p className="font-medium text-slate-200">
                          {assignment.title}
                        </p>

                        <p className="mt-1 text-sm text-blue-400">
                          {assignment.module.code} —{" "}
                          {assignment.module.name}
                        </p>

                      </div>

                      <div className="text-left sm:text-right">

                        <p className="text-sm font-medium text-slate-300">
                          {new Date(
                            assignment.deadline
                          ).toLocaleDateString(
                            undefined,
                            {
                              dateStyle: "medium",
                            }
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatTime(
                            assignment.deadline
                          )}
                        </p>

                      </div>

                    </Link>

                  ))}

              </div>

            )}

          </section>
        )}

    </PageLayout>
  );
}

export default Calendar;
