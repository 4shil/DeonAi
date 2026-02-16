"use client"

type EmptyStateProps = {
  onNewChat: () => void
}

export default function EmptyState({ onNewChat }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="max-w-md">
        {/* Terminal prompt icon */}
        <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-lg bg-terminal-bg-tertiary border border-terminal-border">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent"
          >
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-txt-primary mb-2">
          DeonAI
        </h2>
        <p className="text-sm text-txt-secondary mb-6">
          Start a new conversation or select one from the sidebar.
        </p>

        <button
          onClick={onNewChat}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-accent hover:bg-accent-hover text-terminal-bg font-medium rounded-md transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New chat
        </button>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          <div className="p-3 rounded-md border border-terminal-border bg-terminal-bg-tertiary">
            <p className="text-xs text-txt-muted mb-1">Try asking</p>
            <p className="text-sm text-txt-secondary">"Explain async/await in JavaScript"</p>
          </div>
          <div className="p-3 rounded-md border border-terminal-border bg-terminal-bg-tertiary">
            <p className="text-xs text-txt-muted mb-1">Try asking</p>
            <p className="text-sm text-txt-secondary">"Write a Python script to parse CSV"</p>
          </div>
        </div>
      </div>
    </div>
  )
}
