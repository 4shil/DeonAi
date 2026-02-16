"use client"

import { useRef, useEffect } from 'react'

type ChatInputProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  loading: boolean
  inputRef?: React.RefObject<HTMLTextAreaElement>
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  loading,
  inputRef: externalRef,
}: ChatInputProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null)
  const ref = externalRef || internalRef

  // Auto-resize textarea
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = Math.min(ref.current.scrollHeight, 200) + 'px'
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="border-t border-terminal-border bg-terminal-bg-secondary px-4 py-3 safe-bottom">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 bg-terminal-bg-tertiary border border-terminal-border rounded-lg px-3 py-2 focus-within:border-accent/50 transition-colors">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-txt-primary placeholder:text-txt-muted focus:outline-none py-1"
            disabled={loading}
            style={{ maxHeight: '200px' }}
          />
          <button
            onClick={onSend}
            disabled={loading || !value.trim()}
            className="flex-shrink-0 p-1.5 rounded-md text-txt-muted hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            {loading ? (
              <svg
                className="animate-spin"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[11px] text-txt-muted">
          Enter to send / Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
