"use client";

import { useState } from "react";
import { useSession, signIn as nextAuthSignIn } from "next-auth/react";
import { Sparkles, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Skip auth when not enabled
  if (!authEnabled) return <>{children}</>;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0E14]">
        <Loader2 className="w-6 h-6 text-forge-400 animate-spin" />
      </div>
    );
  }

  if (session?.user) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isSignUp) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed");
          setSubmitting(false);
          return;
        }
        // Auto sign-in after registration
      }

      const result = await nextAuthSignIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(isSignUp ? "Account created but sign-in failed. Try signing in." : "Invalid email or password");
      }
    } catch {
      setError("Something went wrong");
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl forge-gradient flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">PushForge</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isSignUp ? "Create your account" : "Sign in to continue"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-forge-500"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-forge-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl forge-gradient text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isSignUp ? "Create Account" : "Sign In"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-forge-400 hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
