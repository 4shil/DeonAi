"use client"

import { useState, useEffect, useRef } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import AnimatedBackground from './AnimatedBackground'

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

type Conversation = {
  id: string
  title: string
  model_id: string
  created_at: string
}

export default function ChatInterface({ session }: { session: Session }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('google/gemini-2.0-flash-exp:free')
  const [showSettings, setShowSettings] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadConversations()
    const stored = localStorage.getItem('openrouter_key')
    if (stored) setApiKey(stored)
    else setShowSettings(true)
  }, [])

  useEffect(() => {
    if (selectedId) loadMessages(selectedId)
  }, [selectedId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const loadConversations = async () => {
    const res = await fetch(`${API_URL}/api/conversations`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    const data = await res.json()
    setConversations(data)
  }

  const loadMessages = async (id: string) => {
    const res = await fetch(`${API_URL}/api/conversations/${id}/messages`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    const data = await res.json()
    setMessages(data)
  }

  const newConversation = async () => {
    const res = await fetch(`${API_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ title: 'New Chat', model_id: model })
    })
    const conv = await res.json()
    setConversations([conv, ...conversations])
    setSelectedId(conv.id)
    setMessages([])
    setShowSidebar(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = { 
      id: crypto.randomUUID(), 
      role: 'user' as const, 
      content: input, 
      created_at: new Date().toISOString() 
    }
    setMessages([...messages, userMsg])
    setInput('')
    setLoading(true)
    setStreaming('')

    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        message: userMsg.content,
        model_id: model,
        conversation_id: selectedId,
        api_key: apiKey
      })
    })

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader!.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = JSON.parse(line.slice(6))
        if (data.token) setStreaming(prev => prev + data.token)
        if (data.done) {
          setLoading(false)
          if (data.conversation_id) {
            setSelectedId(data.conversation_id)
            loadConversations()
            loadMessages(data.conversation_id)
          }
        }
        if (data.error) {
          alert(data.error)
          setLoading(false)
        }
      }
    }
    setStreaming('')
  }

  const saveApiKey = () => {
    localStorage.setItem('openrouter_key', apiKey)
    setShowSettings(false)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AnimatedBackground />

      {/* Sidebar */}
      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 transition-transform duration-300 lg:translate-x-0`}>
        <div className="glass-strong h-full border-r border-white/10 p-4 backdrop-blur-2xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              <span className="gradient-text">Conversations</span>
            </h2>
            <button 
              onClick={() => setShowSidebar(false)} 
              className="glass rounded-lg p-2 lg:hidden hover-lift"
            >
              ✕
            </button>
          </div>

          {/* New Chat Button */}
          <button 
            onClick={newConversation}
            className="group relative mb-4 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[2px] transition-all hover:shadow-lg hover:shadow-purple-500/50"
          >
            <div className="glass-strong rounded-[14px] px-4 py-3 transition-all group-hover:bg-transparent">
              <span className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
                <span className="text-lg">+</span> New Chat
              </span>
            </div>
          </button>

          {/* Conversations List */}
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {conversations.map((conv, idx) => (
              <button
                key={conv.id}
                onClick={() => { setSelectedId(conv.id); setShowSidebar(false) }}
                className={`group w-full rounded-xl p-3 text-left transition-all hover-lift fade-in ${
                  selectedId === conv.id 
                    ? 'glass-strong border border-white/20' 
                    : 'glass hover:glass-strong'
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-sm text-white/90 group-hover:text-white">
                    {conv.title}
                  </p>
                  {selectedId === conv.id && (
                    <div className="h-2 w-2 animate-pulse-slow rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  )}
                </div>
                <p className="mt-1 text-xs text-white/40">
                  {new Date(conv.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>

          {/* Sign Out */}
          <button 
            onClick={() => supabase.auth.signOut()}
            className="glass hover-lift absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-red-500/50 hover:bg-red-500/10"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Chat Area - Will be completed in Step 5 */}
      <div className="relative z-10 flex flex-1 flex-col lg:ml-80">
        <div className="flex-1" />
      </div>
    </div>
  )
}
