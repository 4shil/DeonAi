"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "../lib/supabaseClient";

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
  const [mode, setMode] = useState<
    "signIn" | "signUp" | "forgot" | "updatePassword"
  >("signIn");
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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-black">
        <p className="text-sm">Loading session...</p>
      </main>
    );
  }

  if (!session || mode === "updatePassword") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-black">
        <div className="w-full max-w-sm space-y-4 rounded border border-black/10 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">
              {mode === "signUp"
                ? "Create account"
                : mode === "forgot"
                ? "Reset password"
                : mode === "updatePassword"
                ? "Set new password"
                : "Sign in"}
            </h1>
            {mode !== "updatePassword" ? (
              <button
                className="text-xs text-black/60"
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
              className="w-full rounded border border-black/20 px-3 py-2"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          ) : null}
          {mode === "signIn" || mode === "signUp" ? (
            <input
              className="w-full rounded border border-black/20 px-3 py-2"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          ) : null}
          {mode === "signUp" ? (
            <input
              className="w-full rounded border border-black/20 px-3 py-2"
              placeholder="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          ) : null}
          {mode === "forgot" ? (
            <p className="text-sm text-black/70">
              We will email you a reset link.
            </p>
          ) : null}
          {mode === "updatePassword" ? (
            <>
              <input
                className="w-full rounded border border-black/20 px-3 py-2"
                placeholder="New password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <input
                className="w-full rounded border border-black/20 px-3 py-2"
                placeholder="Confirm new password"
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
              />
            </>
          ) : null}
          {mode === "signIn" ? (
            <button
              className="w-full rounded bg-black px-4 py-2 text-white disabled:bg-black/40"
              onClick={handleSignIn}
              disabled={isSubmitting || cooldownSeconds > 0}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          ) : null}
          {mode === "signUp" ? (
            <button
              className="w-full rounded bg-black px-4 py-2 text-white disabled:bg-black/40"
              onClick={handleSignUp}
              disabled={isSubmitting || cooldownSeconds > 0}
            >
              {isSubmitting ? "Creating..." : "Create account"}
            </button>
          ) : null}
          {mode === "forgot" ? (
            <button
              className="w-full rounded bg-black px-4 py-2 text-white disabled:bg-black/40"
              onClick={handleForgotPassword}
              disabled={isSubmitting || cooldownSeconds > 0}
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          ) : null}
          {mode === "updatePassword" ? (
            <button
              className="w-full rounded bg-black px-4 py-2 text-white disabled:bg-black/40"
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
          {status ? <p className="text-xs text-black/70">{status}</p> : null}
        </div>
      </main>
    );
  }

  return <>{children(session)}</>;
}
