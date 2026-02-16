"use client"

type HeaderProps = {
  model: string
  onModelChange: (model: string) => void
  onSettingsOpen: () => void
  onSidebarToggle: () => void
}

const MODELS = [
  { id: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash' },
  { id: 'meta-llama/llama-3-8b-instruct:free', label: 'Llama 3 8B' },
]

export default function Header({
  model,
  onModelChange,
  onSettingsOpen,
  onSidebarToggle,
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-terminal-border bg-terminal-bg-secondary">
      <div className="flex items-center gap-3">
        {/* Mobile sidebar toggle */}
        <button
          onClick={onSidebarToggle}
          className="lg:hidden text-txt-muted hover:text-txt-primary transition-colors p-1"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        {/* Model selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-txt-muted hidden sm:inline">Model:</span>
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="bg-terminal-bg-tertiary border border-terminal-border rounded-md px-2.5 py-1 text-xs text-txt-primary focus:outline-none focus:border-accent/50 cursor-pointer"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-terminal-bg">
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Settings */}
        <button
          onClick={onSettingsOpen}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-txt-muted hover:text-txt-primary border border-terminal-border rounded-md hover:bg-terminal-hover transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </div>
  )
}
