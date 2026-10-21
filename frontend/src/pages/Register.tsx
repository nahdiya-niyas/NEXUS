import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "23rem" }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "2.75rem", height: "2.75rem",
              background: "var(--color-primary)",
              borderRadius: "0.75rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.125rem", fontWeight: 800, color: "white",
              margin: "0 auto 1rem",
            }}
          >
            N
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.025em" }}>
            NEXUS
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-3)", marginTop: "0.25rem" }}>
            University Academic Platform
          </p>
        </div>

        <div className="card">
          <div className="card-body" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text)", marginBottom: "1.25rem" }}>
              Create your account
            </h2>

            {error && (
              <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="form-label">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  autoComplete="name"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  required
                  autoComplete="email"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: "100%", marginTop: "0.25rem" }}
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-3)", marginTop: "1.25rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--color-student)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
