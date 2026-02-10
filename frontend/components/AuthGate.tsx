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
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setStatus(null);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Check your email for the magic link.");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-black">
        <p className="text-sm">Loading session...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-black">
        <div className="w-full max-w-sm space-y-4 rounded border border-black/10 p-6">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="text-sm text-black/70">
            Use your email to receive a magic link.
          </p>
          <input
            className="w-full rounded border border-black/20 px-3 py-2"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button
            className="w-full rounded bg-black px-4 py-2 text-white"
            onClick={handleSignIn}
          >
            Send magic link
          </button>
          {status ? <p className="text-xs text-black/70">{status}</p> : null}
        </div>
      </main>
    );
  }

  return <>{children(session)}</>;
}
