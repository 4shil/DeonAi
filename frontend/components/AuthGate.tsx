"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "../lib/supabaseClient";

type AuthMode = "signIn" | "signUp" | "forgot" | "updatePassword";

export default function AuthGate({
  children,
}: {
  children: (session: Session) => React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        if (event === "PASSWORD_RECOVERY") {
          setMode("updatePassword");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!cooldownUntil) {
      setCooldownSeconds(0);
      return;
    }

    const updateCountdown = () => {
      const remainingMs = cooldownUntil - Date.now();
      const remaining = Math.max(0, Math.ceil(remainingMs / 1000));
      setCooldownSeconds(remaining);
      if (remaining <= 0) {
        setCooldownUntil(null);
      }
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [cooldownUntil]);

  const startCooldown = (seconds: number) => {
    if (seconds <= 0) {
      return;
    }
    setCooldownUntil(Date.now() + seconds * 1000);
  };

  const handleRateLimit = (message: string) => {
    if (message.toLowerCase().includes("rate")) {
      startCooldown(60);
    }
  };

  const handleSignIn = async () => {
    setStatus(null);
    if (cooldownSeconds > 0) {
      setStatus(`Please wait ${cooldownSeconds}s before trying again.`);
      return;
    }
    if (!email || !password) {
      setStatus("Enter your email and password.");
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsSubmitting(false);
    if (error) {
      setStatus(error.message);
      handleRateLimit(error.message);
    } else {
      startCooldown(10);
    }
  };

  const handleSignUp = async () => {
    setStatus(null);
    if (cooldownSeconds > 0) {
      setStatus(`Please wait ${cooldownSeconds}s before trying again.`);
      return;
    }
    if (!email || !password) {
      setStatus("Enter your email and password.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setIsSubmitting(false);
    if (error) {
      setStatus(error.message);
      handleRateLimit(error.message);
    } else {
      setStatus("Check your email to confirm your account.");
      startCooldown(30);
    }
  };

  const handleForgotPassword = async () => {
    setStatus(null);
    if (cooldownSeconds > 0) {
      setStatus(`Please wait ${cooldownSeconds}s before trying again.`);
      return;
    }
    if (!email) {
      setStatus("Enter your email to receive a reset link.");
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setIsSubmitting(false);
    if (error) {
      setStatus(error.message);
      handleRateLimit(error.message);
    } else {
      setStatus("Password reset link sent. Check your email.");
      startCooldown(60);
    }
  };

  const handleUpdatePassword = async () => {
    setStatus(null);
    if (!newPassword) {
      setStatus("Enter a new password.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setStatus("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setIsSubmitting(false);
    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Password updated. You can continue.");
      setMode("signIn");
    }
  };

  const handleGoogleOAuth = async () => {
    setStatus(null);
    if (cooldownSeconds > 0) {
      setStatus(`Please wait ${cooldownSeconds}s before trying again.`);
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    setIsSubmitting(false);
    if (error) {
      setStatus(error.message);
      handleRateLimit(error.message);
    } else {
      startCooldown(10);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10 text-[#0b0b0b]">
        <div className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur">
          Loading secure session...
        </div>
      </main>
    );
  }

  if (!session || mode === "updatePassword") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10 text-[#0b0b0b]">
        <div className="w-full max-w-md space-y-5 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.16)] backdrop-blur motion-safe:animate-[rise_600ms_ease-out]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-black/50">
                Orbit AI
              </p>
              <h1 className="text-2xl font-semibold">
                {mode === "signUp"
                  ? "Create account"
                  : mode === "forgot"
                  ? "Reset password"
                  : mode === "updatePassword"
                  ? "Set new password"
                  : "Sign in"}
              </h1>
              <p className="mt-1 text-sm text-black/60">
                {mode === "signUp"
                  ? "Start chatting in seconds with your workspace."
                  : mode === "forgot"
                  ? "We will send a reset link to your inbox."
                  : mode === "updatePassword"
                  ? "Create a new password to secure your account."
                  : "Welcome back. Pick up where you left off."}
              </p>
            </div>
            {mode !== "updatePassword" ? (
              <button
                className="rounded-full border border-black/10 px-3 py-1 text-[11px] text-black/70"
                onClick={() => {
                  setStatus(null);
                  setMode(mode === "signUp" ? "signIn" : "signUp");
                }}
              >
                {mode === "signUp" ? "Have an account?" : "Create account"}
              </button>
            ) : null}
          </div>
          {mode !== "updatePassword" ? (
            <input
              className="w-full rounded-xl border border-black/15 bg-white/70 px-3 py-2.5 text-sm"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          ) : null}
          {mode === "signIn" || mode === "signUp" ? (
            <input
              className="w-full rounded-xl border border-black/15 bg-white/70 px-3 py-2.5 text-sm"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          ) : null}
          {mode === "signUp" ? (
            <input
              className="w-full rounded-xl border border-black/15 bg-white/70 px-3 py-2.5 text-sm"
              placeholder="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          ) : null}
          {mode === "updatePassword" ? (
            <>
              <input
                className="w-full rounded-xl border border-black/15 bg-white/70 px-3 py-2.5 text-sm"
                placeholder="New password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <input
                className="w-full rounded-xl border border-black/15 bg-white/70 px-3 py-2.5 text-sm"
                placeholder="Confirm new password"
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
              />
            </>
          ) : null}
          {mode === "signIn" ? (
            <button
              className="w-full rounded-xl bg-[#0b0b0b] px-4 py-2.5 text-sm text-white shadow-[0_12px_30px_rgba(15,23,42,0.2)] disabled:bg-black/40"
              onClick={handleSignIn}
              disabled={isSubmitting || cooldownSeconds > 0}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          ) : null}
          {mode === "signUp" ? (
            <button
              className="w-full rounded-xl bg-[#0b0b0b] px-4 py-2.5 text-sm text-white shadow-[0_12px_30px_rgba(15,23,42,0.2)] disabled:bg-black/40"
              onClick={handleSignUp}
              disabled={isSubmitting || cooldownSeconds > 0}
            >
              {isSubmitting ? "Creating..." : "Create account"}
            </button>
          ) : null}
          {mode === "signIn" || mode === "signUp" ? (
            <button
              className="w-full rounded-xl border border-black/15 bg-white/70 px-4 py-2.5 text-sm text-black/80 disabled:text-black/40"
              onClick={handleGoogleOAuth}
              disabled={isSubmitting || cooldownSeconds > 0}
            >
              Continue with Google
            </button>
          ) : null}
          {mode === "forgot" ? (
            <button
              className="w-full rounded-xl bg-[#0b0b0b] px-4 py-2.5 text-sm text-white shadow-[0_12px_30px_rgba(15,23,42,0.2)] disabled:bg-black/40"
              onClick={handleForgotPassword}
              disabled={isSubmitting || cooldownSeconds > 0}
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          ) : null}
          {mode === "updatePassword" ? (
            <button
              className="w-full rounded-xl bg-[#0b0b0b] px-4 py-2.5 text-sm text-white shadow-[0_12px_30px_rgba(15,23,42,0.2)] disabled:bg-black/40"
              onClick={handleUpdatePassword}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update password"}
            </button>
          ) : null}
          {mode !== "updatePassword" ? (
            <button
              className="text-left text-xs text-black/60"
              onClick={() => {
                setStatus(null);
                setMode(mode === "forgot" ? "signIn" : "forgot");
              }}
            >
              {mode === "forgot" ? "Back to sign in" : "Forgot password?"}
            </button>
          ) : null}
          {status ? (
            <div className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-xs text-black/70">
              {status}
            </div>
          ) : null}
        </div>
      </main>
    );
  }

  return <>{children(session)}</>;
}
