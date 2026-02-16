"use client"

export default function TypingIndicator() {
  return (
    <div className="flex justify-start fade-in">
      <div className="bg-terminal-bg-tertiary border border-terminal-border rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] lg:max-w-[75%]">
        <span className="text-xs font-medium text-txt-muted mb-1.5 block">
          DeonAI
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-txt-muted typing-dot" />
          <div className="w-1.5 h-1.5 rounded-full bg-txt-muted typing-dot" />
          <div className="w-1.5 h-1.5 rounded-full bg-txt-muted typing-dot" />
        </div>
      </div>
    </div>
  )
}
