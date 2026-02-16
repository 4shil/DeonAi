"use client"

import { supabase } from '@/lib/supabase'

type Conversation = {
  id: string
  title: string
  model_id: string
  created_at: string
}

type SidebarProps = {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  isOpen: boolean
  onClose: () => void
  searchQuery: string
  onSearchChange: (q: string) => void
}

export default function Sidebar({
  conversations,
  selectedId,
  onSelect,
  onNew,
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-terminal-border bg-terminal-bg-secondary flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-terminal-border">
          <span className="text-sm font-semibold text-txt-primary tracking-wide">
            DeonAI
          </span>
          <button
            onClick={onClose}
            className="text-txt-muted hover:text-txt-primary transition-colors lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New Chat button */}
        <div className="px-3 py-3">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-txt-secondary hover:text-txt-primary hover:bg-terminal-hover rounded-md transition-colors border border-terminal-border"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New chat
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full px-3 py-1.5 text-xs bg-terminal-bg-tertiary border border-terminal-border rounded-md text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-accent/50"
          />
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {filtered.length === 0 && (
            <p className="text-xs text-txt-muted px-3 py-4">
              {searchQuery ? 'No matches found' : 'No conversations yet'}
            </p>
          )}
          {filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                onSelect(conv.id)
                onClose()
              }}
              className={`w-full text-left px-3 py-2 mb-0.5 rounded-md text-sm transition-colors ${
                selectedId === conv.id
                  ? 'bg-terminal-hover text-txt-primary'
                  : 'text-txt-secondary hover:bg-terminal-bg-tertiary hover:text-txt-primary'
              }`}
            >
              <p className="truncate">{conv.title}</p>
              <p className="text-xs text-txt-muted mt-0.5">
                {new Date(conv.created_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>

        {/* Sign out */}
        <div className="px-3 py-3 border-t border-terminal-border">
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full px-3 py-2 text-sm text-txt-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  )
}
