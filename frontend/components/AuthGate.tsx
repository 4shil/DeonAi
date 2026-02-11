"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

export default function AuthGate({ children }: { children: (session: Session) => React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setError('Check your email for confirmation link')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-light tracking-widest text-white">
              DEON<span className="text-white/40">AI</span>
            </h1>
            <p className="text-sm font-light tracking-wide text-white/40">AI Assistant</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
            <h2 className="mb-6 text-xl font-light tracking-wider text-white">
              {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </h2>

            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-4 font-light text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-4 font-light text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
                required
              />

              {error && (
                <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl border border-white/30 bg-white/20 px-4 py-4 text-sm font-light tracking-widest text-white transition-all hover:bg-white/30 disabled:opacity-50"
              >
                {submitting ? 'LOADING...' : (isSignUp ? 'SIGN UP' : 'SIGN IN')}
              </button>
            </form>

            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-4 w-full text-center text-sm text-white/40 hover:text-white"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children(session)}</>
}
