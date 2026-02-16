"use client"

import AuthGate from '@/components/AuthGate'
import ChatInterface from '@/components/ChatInterface'

export default function Home() {
  return (
    <main className="h-screen bg-terminal-bg">
      <AuthGate>
        {(session) => <ChatInterface session={session} />}
      </AuthGate>
    </main>
  )
}
