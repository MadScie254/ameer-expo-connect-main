import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin-login")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "Admin Login | Ameer Expo 2026" }] }),
});

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      if (res.error) {
        setError(res.error.message || "Sign in failed");
        return;
      }

      // On success redirect to admin
      window.location.href = "/admin";
    } catch (err: unknown) {
      setError("Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/40 flex items-center justify-center">
      <main className="w-full max-w-md p-6 bg-card rounded-3xl border border-border/60 shadow-elegant">
        <h1 className="text-2xl font-bold mb-4">Admin Sign In</h1>
        {error && <div className="text-sm text-red-500 mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border bg-secondary/50 px-3 py-2 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border bg-secondary/50 px-3 py-2 outline-none"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AdminLogin;
