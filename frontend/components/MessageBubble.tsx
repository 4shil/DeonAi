"use client"

import { useState } from 'react'

type MessageBubbleProps = {
  role: 'user' | 'assistant'
  content: string
}

function formatContent(content: string) {
  const parts: React.ReactNode[] = []
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
  const inlineCodeRegex = /`([^`]+)`/g
  let lastIndex = 0
  let match

  const tempContent = content
  const codeBlocks: { start: number; end: number; lang: string; code: string }[] = []

  while ((match = codeBlockRegex.exec(tempContent)) !== null) {
    codeBlocks.push({
      start: match.index,
      end: match.index + match[0].length,
      lang: match[1] || 'text',
      code: match[2].trim(),
    })
  }

  if (codeBlocks.length === 0) {
    // Process inline code only
    return processInlineCode(content)
  }

  codeBlocks.forEach((block, i) => {
    // Text before code block
    if (block.start > lastIndex) {
      const textBefore = content.slice(lastIndex, block.start)
      parts.push(<span key={`text-${i}`}>{processInlineCode(textBefore)}</span>)
    }

    // Code block
    parts.push(
      <CodeBlock key={`code-${i}`} language={block.lang} code={block.code} />
    )

    lastIndex = block.end
  })

  // Remaining text after last code block
  if (lastIndex < content.length) {
    const remaining = content.slice(lastIndex)
    parts.push(<span key="text-end">{processInlineCode(remaining)}</span>)
  }

  return parts
}

function processInlineCode(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /`([^`]+)`/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`t-${lastIndex}`}>
          {formatBasicMarkdown(text.slice(lastIndex, match.index))}
        </span>
      )
    }
    parts.push(
      <code
        key={`ic-${match.index}`}
        className="px-1.5 py-0.5 bg-terminal-bg-tertiary border border-terminal-border rounded text-sm font-mono text-accent"
      >
        {match[1]}
      </code>
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(
      <span key={`t-${lastIndex}`}>
        {formatBasicMarkdown(text.slice(lastIndex))}
      </span>
    )
  }

  return parts
}

function formatBasicMarkdown(text: string): React.ReactNode {
  // Bold
  const boldRegex = /\*\*(.+?)\*\*/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <strong key={`b-${match.index}`} className="font-semibold text-txt-primary">
        {match[1]}
      </strong>
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 rounded-md border border-terminal-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-terminal-bg-tertiary border-b border-terminal-border">
        <span className="text-xs text-txt-muted font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-txt-muted hover:text-txt-primary transition-colors"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto bg-terminal-bg text-sm">
        <code className="font-mono text-txt-secondary">{code}</code>
      </pre>
    </div>
  )
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} fade-in group`}>
      <div
        className={`relative max-w-[85%] lg:max-w-[75%] ${
          isUser
            ? 'bg-accent/15 border border-accent/20 rounded-2xl rounded-br-md'
            : 'bg-terminal-bg-tertiary border border-terminal-border rounded-2xl rounded-bl-md'
        } px-4 py-3`}
      >
        {/* Role label */}
        <div className="flex items-center justify-between mb-1.5">
          <span
            className={`text-xs font-medium ${
              isUser ? 'text-accent' : 'text-txt-muted'
            }`}
          >
            {isUser ? 'You' : 'DeonAI'}
          </span>

          {/* Copy button */}
          <button
            onClick={handleCopyMessage}
            className="opacity-0 group-hover:opacity-100 text-xs text-txt-muted hover:text-txt-primary transition-all ml-3"
            title="Copy message"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap text-txt-primary">
          {formatContent(content)}
        </div>
      </div>
    </div>
  )
}
