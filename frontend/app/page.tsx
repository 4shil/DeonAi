"use client"

import AuthGate from '@/components/AuthGate'
import ChatInterface from '@/components/ChatInterface'

export default function Home() {
  return (
    <AuthGate>
      {(session) => <ChatInterface session={session} />}
    </AuthGate>
  )
}
