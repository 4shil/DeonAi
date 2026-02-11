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
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              <span className="gradient-text">Conversations</span>
            </h2>
            <button onClick={() => setShowSidebar(false)} className="glass rounded-lg p-2 lg:hidden hover-lift">
              ✕
            </button>
          </div>

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

          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {conversations.map((conv, idx) => (
              <button
                key={conv.id}
                onClick={() => { setSelectedId(conv.id); setShowSidebar(false) }}
                className={`group w-full rounded-xl p-3 text-left transition-all hover-lift fade-in ${
                  selectedId === conv.id ? 'glass-strong border border-white/20' : 'glass hover:glass-strong'
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-sm text-white/90 group-hover:text-white">{conv.title}</p>
                  {selectedId === conv.id && (
                    <div className="h-2 w-2 animate-pulse-slow rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  )}
                </div>
                <p className="mt-1 text-xs text-white/40">{new Date(conv.created_at).toLocaleDateString()}</p>
              </button>
            ))}
          </div>

          <button 
            onClick={() => supabase.auth.signOut()}
            className="glass hover-lift absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-red-500/50 hover:bg-red-500/10"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="relative z-10 flex flex-1 flex-col lg:ml-80">
        {/* Header */}
        <div className="glass-strong border-b border-white/10 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setShowSidebar(true)} 
              className="glass hover-lift rounded-xl px-4 py-2 lg:hidden"
            >
              ☰
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowSettings(true)}
                className="glass hover-lift shimmer rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold transition-all hover:border-purple-500/50"
              >
                🔑 API Key
              </button>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="glass hover-lift rounded-xl border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold text-white transition-all focus:border-purple-500/50 focus:outline-none"
              >
                <option value="google/gemini-2.0-flash-exp:free" className="bg-black">Gemini 2.0</option>
                <option value="meta-llama/llama-3-8b-instruct:free" className="bg-black">Llama 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {messages.length === 0 && !streaming && (
              <div className="flex h-full flex-col items-center justify-center text-center fade-in">
                <div className="mb-4 text-6xl">✨</div>
                <h3 className="mb-2 text-2xl font-bold gradient-text">Start a Conversation</h3>
                <p className="text-white/50">Ask me anything!</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div 
                key={msg.id} 
                className={`flex fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`group max-w-[85%] rounded-2xl px-5 py-4 transition-all hover-lift ${
                  msg.role === 'user' 
                    ? 'glass-strong border border-white/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10' 
                    : 'glass'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 rounded-full p-2 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}>
                      <span className="text-xs">{msg.role === 'user' ? '👤' : '🤖'}</span>
                    </div>
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap text-white/90">{msg.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {streaming && (
              <div className="flex justify-start fade-in">
                <div className="glass hover-lift group max-w-[85%] rounded-2xl px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-2">
                      <span className="text-xs">🤖</span>
                    </div>
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap text-white/90">{streaming}</p>
                      <div className="mt-2 flex gap-1">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-purple-500" style={{ animationDelay: '0s' }} />
                        <div className="h-2 w-2 animate-pulse rounded-full bg-purple-500" style={{ animationDelay: '0.2s' }} />
                        <div className="h-2 w-2 animate-pulse rounded-full bg-purple-500" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="glass-strong border-t border-white/10 p-4 backdrop-blur-2xl">
          <div className="mx-auto max-w-4xl">
            <div className="glass-strong hover-lift flex items-end gap-3 rounded-3xl border border-white/20 p-3 transition-all focus-within:border-purple-500/50 focus-within:shadow-lg focus-within:shadow-purple-500/20">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 resize-none bg-transparent px-3 py-2 text-white placeholder:text-white/40 focus:outline-none"
                disabled={loading}
                style={{ maxHeight: '200px' }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[2px] transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50"
              >
                <div className="glass-strong rounded-[14px] px-5 py-3 transition-all group-hover:bg-transparent">
                  <span className="text-lg">{loading ? '⏳' : '🚀'}</span>
                </div>
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-white/30">Press Enter to send, Shift+Enter for new line</p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm fade-in">
          <div className="glass-strong hover-lift w-full max-w-md rounded-3xl border border-white/20 p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold gradient-text">API Settings</h2>
              <div className="h-2 w-2 animate-pulse-slow rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            </div>
            
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-white/70">OpenRouter API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="glass w-full rounded-2xl border border-white/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              <p className="mt-2 text-xs text-white/40">
                Get your key from{' '}
                <a href="https://openrouter.ai/keys" target="_blank" className="gradient-text hover:underline">
                  openrouter.ai/keys
                </a>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveApiKey}
                className="group relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-[2px] transition-all hover:shadow-lg hover:shadow-purple-500/50"
              >
                <div className="glass-strong rounded-[14px] px-4 py-3 transition-all group-hover:bg-transparent">
                  <span className="text-sm font-semibold text-white">Save</span>
                </div>
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="glass hover-lift flex-1 rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold transition-all hover:border-white/30"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
