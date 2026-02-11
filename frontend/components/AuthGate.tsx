"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import AnimatedBackground from './AnimatedBackground'

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
      <div className="flex h-screen items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-white" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <AnimatedBackground />
        
        <div className="relative z-10 w-full max-w-md fade-in">
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-6xl font-bold tracking-tight">
              <span className="gradient-text">Deon</span>
              <span className="text-white/90">AI</span>
            </h1>
            <p className="text-sm font-light tracking-widest text-white/50">
              INTELLIGENT • RESPONSIVE • MODERN
            </p>
          </div>

          {/* Auth Card */}
          <div className="glass-strong hover-lift shimmer rounded-3xl p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-wide text-white">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <div className="h-2 w-2 animate-pulse-slow rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="group">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass w-full rounded-2xl px-5 py-4 text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  required
                />
              </div>
              
              <div className="group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass w-full rounded-2xl px-5 py-4 text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  required
                />
              </div>

              {error && (
                <div className="glass rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300 border-red-500/20">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[2px] transition-all hover:shadow-lg hover:shadow-purple-500/50"
              >
                <div className="glass-strong rounded-[14px] px-6 py-4 transition-all group-hover:bg-transparent">
                  <span className="text-sm font-semibold tracking-widest text-white">
                    {submitting ? 'PROCESSING...' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
                  </span>
                </div>
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-white/50 transition-colors hover:text-white/80"
              >
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <span className="gradient-text font-semibold">
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </span>
              </button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="mt-8 flex justify-center gap-2">
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-blue-500 to-transparent" />
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-purple-500 to-transparent" />
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-pink-500 to-transparent" />
          </div>
        </div>
      </div>
    )
  }

  return <>{children(session)}</>
}
