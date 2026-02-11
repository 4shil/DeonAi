"use client"

import { useState, useEffect, useRef } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

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

    const userMsg = { id: crypto.randomUUID(), role: 'user' as const, content: input, created_at: new Date().toISOString() }
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
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 border-r border-white/10 bg-black/90 p-4 backdrop-blur-2xl transition-transform lg:translate-x-0`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-light tracking-wider">CHATS</h2>
          <button onClick={() => setShowSidebar(false)} className="lg:hidden">✕</button>
        </div>
        <button onClick={newConversation} className="mb-4 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm">
          + NEW CHAT
        </button>
        <div className="space-y-2">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => { setSelectedId(conv.id); setShowSidebar(false) }}
              className={`w-full rounded-xl p-3 text-left text-sm ${selectedId === conv.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              {conv.title}
            </button>
          ))}
        </div>
        <button onClick={() => supabase.auth.signOut()} className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 px-4 py-3 text-sm">
          SIGN OUT
        </button>
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col lg:ml-80">
        {/* Header */}
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setShowSidebar(true)} className="lg:hidden">☰</button>
            <div className="flex gap-2">
              <button onClick={() => setShowSettings(true)} className="rounded-xl border border-white/20 px-4 py-2 text-sm">
                🔑 API KEY
              </button>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm"
              >
                <option value="google/gemini-2.0-flash-exp:free">Gemini 2.0</option>
                <option value="meta-llama/llama-3-8b-instruct:free">Llama 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.map(msg => (
            <div key={msg.id} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-white/10' : 'bg-white/5'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {streaming && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-white/5 px-4 py-3">{streaming}</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Message..."
              className="flex-1 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 focus:outline-none"
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading} className="rounded-2xl bg-white/20 px-6 py-3">
              {loading ? '...' : '→'}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black p-8">
            <h2 className="mb-4 text-xl font-light">API KEY</h2>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="mb-4 w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3"
            />
            <div className="flex gap-2">
              <button onClick={saveApiKey} className="flex-1 rounded-2xl bg-white/20 px-4 py-3">SAVE</button>
              <button onClick={() => setShowSettings(false)} className="flex-1 rounded-2xl border border-white/20 px-4 py-3">CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
