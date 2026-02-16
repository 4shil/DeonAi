"use client"

import { useState, useEffect, useRef } from 'react'
import type { Session } from '@supabase/supabase-js'
import Sidebar from './Sidebar'
import Header from './Header'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import SettingsModal from './SettingsModal'
import EmptyState from './EmptyState'
import TypingIndicator from './TypingIndicator'

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
  const [searchQuery, setSearchQuery] = useState('')
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N: New conversation
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        newConversation()
      }
      // Cmd/Ctrl + K: Focus search in sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSidebar(true)
        // Focus will be handled by the sidebar search input
      }
      // Cmd/Ctrl + ,: Open settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        setShowSettings(true)
      }
      // Escape: Close sidebar/settings or focus input
      if (e.key === 'Escape') {
        if (showSettings) {
          setShowSettings(false)
        } else if (showSidebar) {
          setShowSidebar(false)
        } else {
          inputRef.current?.focus()
        }
      }
      // / key when not typing: focus input
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showSettings, showSidebar])

  const loadConversations = async () => {
    const res = await fetch(`${API_URL}/api/conversations`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const data = await res.json()
    setConversations(data)
  }

  const loadMessages = async (id: string) => {
    const res = await fetch(`${API_URL}/api/conversations/${id}/messages`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const data = await res.json()
    setMessages(data)
  }

  const newConversation = async () => {
    const res = await fetch(`${API_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ title: 'New Chat', model_id: model }),
    })
    const conv = await res.json()
    setConversations([conv, ...conversations])
    setSelectedId(conv.id)
    setMessages([])
    setShowSidebar(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: input,
      created_at: new Date().toISOString(),
    }
    setMessages([...messages, userMsg])
    setInput('')
    setLoading(true)
    setStreaming('')

    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        message: userMsg.content,
        model_id: model,
        conversation_id: selectedId,
        api_key: apiKey,
      }),
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
        if (data.token) setStreaming((prev) => prev + data.token)
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

  const saveApiKey = (key: string) => {
    setApiKey(key)
    localStorage.setItem('openrouter_key', key)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-terminal-bg">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNew={newConversation}
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col lg:ml-72">
        {/* Header */}
        <Header
          model={model}
          onModelChange={setModel}
          onSettingsOpen={() => setShowSettings(true)}
          onSidebarToggle={() => setShowSidebar(true)}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !streaming ? (
            <EmptyState onNewChat={newConversation} />
          ) : (
            <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                />
              ))}

              {streaming && (
                <MessageBubble role="assistant" content={streaming} />
              )}

              {loading && !streaming && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={sendMessage}
          loading={loading}
          inputRef={inputRef}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        onSave={saveApiKey}
      />
    </div>
  )
}
