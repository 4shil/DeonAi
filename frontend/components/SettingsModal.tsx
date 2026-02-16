"use client"

import { useState, useEffect, useRef } from 'react'

type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
  apiKey: string
  onSave: (key: string) => void
}

export default function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  onSave,
}: SettingsModalProps) {
  const [key, setKey] = useState(apiKey)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setKey(apiKey)
  }, [apiKey])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSave = () => {
    onSave(key)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 fade-in">
      <div
        className="w-full max-w-md bg-terminal-bg-secondary border border-terminal-border rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-terminal-border">
          <h2 className="text-sm font-semibold text-txt-primary">Settings</h2>
          <button
            onClick={onClose}
            className="text-txt-muted hover:text-txt-primary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="px-5 py-4">
          <label className="block text-xs text-txt-secondary mb-1.5">
            OpenRouter API Key
          </label>
          <input
            ref={inputRef}
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-or-v1-..."
            className="w-full px-3 py-2 text-sm bg-terminal-bg-tertiary border border-terminal-border rounded-md text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-accent/50"
          />
          <p className="mt-2 text-[11px] text-txt-muted">
            Get your key from{' '}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              openrouter.ai/keys
            </a>
          </p>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-terminal-border">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-txt-muted hover:text-txt-primary border border-terminal-border rounded-md hover:bg-terminal-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-xs text-terminal-bg bg-accent hover:bg-accent-hover rounded-md font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
