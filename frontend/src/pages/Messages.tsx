
import { FormEvent, useState } from "react";
import Navbar from "../components/Navbar";

function Messages() {
  const [lecturerEmail, setLecturerEmail] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (!lecturerEmail.trim()) {
      setError("Please enter the lecturer's email.");
      return;
    }

    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    if (!message.trim()) {
      setError("Please enter your message.");
      return;
    }

    const mailto =
      `mailto:${encodeURIComponent(
        lecturerEmail.trim()
      )}` +
      `?subject=${encodeURIComponent(
        subject.trim()
      )}` +
      `&body=${encodeURIComponent(
        message.trim()
      )}`;

    window.location.href = mailto;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-8">
          <p className="font-medium text-blue-400">
            Communication
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Message Lecturer
          </h1>

          <p className="mt-2 text-slate-400">
            Contact your lecturer about assignments,
            modules, or academic questions.
          </p>
        </div>

        {/* MESSAGE CARD */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

          {error && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* LECTURER EMAIL */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Lecturer Email
              </label>

              <input
                type="email"
                value={lecturerEmail}
                onChange={(event) =>
                  setLecturerEmail(
                    event.target.value
                  )
                }
                placeholder="lecturer@example.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />

            </div>

            {/* SUBJECT */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Subject
              </label>

              <input
                type="text"
                value={subject}
                onChange={(event) =>
                  setSubject(
                    event.target.value
                  )
                }
                placeholder="Question about N3462 assignment"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />

            </div>

            {/* MESSAGE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Message
              </label>

              <textarea
                rows={8}
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                placeholder="Write your message..."
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />

            </div>

            {/* SEND */}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Open Email & Send
            </button>

          </form>

        </section>

        {/* INFO */}

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-500">
          The message will open in your default email application
          with the lecturer's email, subject, and message already filled in.
        </div>

      </main>

    </div>
  );
}

export default Messages;
