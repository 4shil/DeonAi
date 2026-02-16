"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

export default function AuthGate({
  children,
}: {
  children: (session: Session) => React.ReactNode
}) {
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
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
      <div className="flex h-screen items-center justify-center bg-terminal-bg">
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin text-accent"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span className="text-sm text-txt-muted">Loading...</span>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-terminal-bg p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-terminal-bg-tertiary border border-terminal-border mb-4">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-accent"
              >
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-txt-primary">DeonAI</h1>
            <p className="text-xs text-txt-muted mt-1">
              Terminal-style AI assistant
            </p>
          </div>

          {/* Auth card */}
          <div className="bg-terminal-bg-secondary border border-terminal-border rounded-lg p-6">
            <h2 className="text-sm font-medium text-txt-primary mb-4">
              {isSignUp ? 'Create account' : 'Sign in'}
            </h2>

            <form onSubmit={handleAuth} className="space-y-3">
              <div>
                <label className="block text-xs text-txt-muted mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-terminal-bg-tertiary border border-terminal-border rounded-md text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-accent/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-txt-muted mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-terminal-bg-tertiary border border-terminal-border rounded-md text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-accent/50"
                  required
                />
              </div>

              {error && (
                <div className="px-3 py-2 text-xs rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-terminal-bg rounded-md transition-colors disabled:opacity-50"
              >
                {submitting
                  ? 'Processing...'
                  : isSignUp
                  ? 'Create account'
                  : 'Sign in'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-txt-muted hover:text-txt-primary transition-colors"
              >
                {isSignUp
                  ? 'Already have an account? '
                  : "Don't have an account? "}
                <span className="text-accent">
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children(session)}</>
}
