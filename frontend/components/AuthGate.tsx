"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthGate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Check your email for confirmation");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="mb-2 font-light tracking-widest text-3xl text-white">
            DEON<span className="text-white/40">AI</span>
          </h1>
          <p className="font-light tracking-wide text-sm text-white/40">
            Intelligent Assistant
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
          <div className="mb-8">
            <h2 className="mb-2 font-light tracking-wider text-xl text-white">
              {isSignUp ? "CREATE ACCOUNT" : "WELCOME BACK"}
            </h2>
            <p className="font-light tracking-wide text-sm text-white/40">
              {isSignUp ? "Start your journey" : "Continue your conversations"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block font-light tracking-wider text-xs text-white/60">
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-4 font-light tracking-wide text-white/90 backdrop-blur-xl placeholder:text-white/30 focus:border-white/40 focus:bg-white/10 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-2 block font-light tracking-wider text-xs text-white/60">
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-4 font-light tracking-wide text-white/90 backdrop-blur-xl placeholder:text-white/30 focus:border-white/40 focus:bg-white/10 focus:outline-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 backdrop-blur-xl">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-light tracking-wide text-sm text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 backdrop-blur-xl">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 flex-shrink-0 text-green-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-light tracking-wide text-sm text-green-300">{message}</p>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl border border-white/30 bg-white/20 px-4 py-4 font-light tracking-widest text-sm backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:bg-white/30 active:scale-95 disabled:border-white/10 disabled:bg-white/5 disabled:opacity-40"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border border-white/20 border-t-white"></div>
                  <span>{isSignUp ? "CREATING..." : "SIGNING IN..."}</span>
                </div>
              ) : (
                <span>{isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}</span>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setMessage("");
              }}
              className="font-light tracking-wide text-sm text-white/40 transition-colors hover:text-white"
            >
              {isSignUp ? (
                <>
                  Have an account?{" "}
                  <span className="text-white underline">Sign In</span>
                </>
              ) : (
                <>
                  No account?{" "}
                  <span className="text-white underline">Sign Up</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center font-light tracking-wide text-xs text-white/30">
          By continuing, you agree to our Terms & Privacy
        </div>
      </div>
    </div>
  );
}
