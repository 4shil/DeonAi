"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatAreaProps = {
  title: string;
  modelId: string;
  onModelChange: (value: string) => void;
  messages: Message[];
  streamingMessage: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
  isLoadingMessages: boolean;
  hasConversation: boolean;
  canRename: boolean;
  isRenaming: boolean;
  onRenameConversation: (title: string) => Promise<void> | void;
  onOpenSidebar: () => void;
  availableModels: Array<{ id: string; name: string }>;
  isLoadingModels: boolean;
  onOpenApiKeySettings: () => void;
};

export default function ChatArea({
  title,
  modelId,
  onModelChange,
  messages,
  streamingMessage,
  inputValue,
  onInputChange,
  onSend,
  isStreaming,
  isLoadingMessages,
  hasConversation,
  canRename,
  isRenaming,
  onRenameConversation,
  onOpenSidebar,
  availableModels,
  isLoadingModels,
  onOpenApiKeySettings,
}: ChatAreaProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setDraftTitle(title);
  }, [title]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSaveTitle = async () => {
    const nextTitle = draftTitle.trim();
    if (!nextTitle || !canRename) {
      return;
    }
    await onRenameConversation(nextTitle);
    setIsEditingTitle(false);
  };

  return (
    <section className="relative flex h-screen flex-1 flex-col overflow-hidden bg-black text-white">
      {/* Animated gradient background */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-20 blur-3xl"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.3), transparent 60%)`
        }}
      />

      {/* Header - Minimal & Clean */}
      <header className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-2xl">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Menu & Title */}
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <button
                onClick={onOpenSidebar}
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 lg:hidden"
                aria-label="Open sidebar"
              >
                <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {isEditingTitle ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-light tracking-wide backdrop-blur-xl placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 focus:outline-none"
                    maxLength={120}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    disabled={isRenaming}
                    className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-light tracking-wider backdrop-blur-xl transition-all hover:bg-white/10 disabled:opacity-40"
                  >
                    {isRenaming ? "..." : "SAVE"}
                  </button>
                  <button
                    onClick={() => {
                      setDraftTitle(title);
                      setIsEditingTitle(false);
                    }}
                    className="text-xs font-light tracking-wider text-white/60 transition-colors hover:text-white"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <h1 className="truncate font-light tracking-wide text-white/90">
                    {title}
                  </h1>
                  {canRename && (
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="group flex-shrink-0 opacity-40 transition-all duration-300 hover:opacity-100"
                      aria-label="Edit title"
                    >
                      <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right: Settings & Model */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenApiKeySettings}
                className="group flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                aria-label="API Settings"
              >
                <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="hidden text-xs font-light tracking-wider sm:inline">KEY</span>
              </button>

              <select
                value={modelId}
                onChange={(e) => onModelChange(e.target.value)}
                disabled={isLoadingModels}
                className="h-10 max-w-[160px] truncate rounded-full border border-white/10 bg-white/5 px-4 text-xs font-light tracking-wide backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 focus:border-white/30 focus:bg-white/10 focus:outline-none disabled:opacity-40"
              >
                {isLoadingModels ? (
                  <option>Loading...</option>
                ) : availableModels.length > 0 ? (
                  availableModels.map((model) => (
                    <option key={model.id} value={model.id} className="bg-black">
                      {model.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="google/gemini-2.0-flash-exp:free" className="bg-black">Gemini 2.0</option>
                    <option value="meta-llama/llama-3-8b-instruct:free" className="bg-black">Llama 3</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-12">
          {!hasConversation && !isLoadingMessages ? (
            <div className="flex h-full min-h-[60vh] items-center justify-center">
              <div className="max-w-xl text-center">
                <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl">
                  <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h2 className="mb-3 font-light text-2xl tracking-wide text-white/90">Start a conversation</h2>
                <p className="font-light text-sm tracking-wide text-white/40">Select or create a new chat from the sidebar</p>
              </div>
            </div>
          ) : null}

          {isLoadingMessages ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl">
                <div className="h-5 w-5 animate-spin rounded-full border border-white/20 border-t-white"></div>
                <span className="text-sm font-light tracking-wide text-white/60">Loading...</span>
              </div>
            </div>
          ) : null}

          {hasConversation && messages.length === 0 && !streamingMessage && !isLoadingMessages ? (
            <div className="flex h-full min-h-[60vh] items-center justify-center">
              <div className="max-w-xl text-center">
                <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl">
                  <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="mb-3 font-light text-2xl tracking-wide text-white/90">Ready</h2>
                <p className="font-light text-sm tracking-wide text-white/40">Ask me anything</p>
              </div>
            </div>
          ) : null}

          <div className="space-y-8">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`group flex animate-[fadeIn_600ms_ease-out] ${isUser ? "justify-end" : "justify-start"}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`relative max-w-[85%] transition-all duration-500 sm:max-w-[75%] ${
                      isUser
                        ? "rounded-3xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl"
                        : "rounded-3xl border border-white/5 bg-white/[0.02] px-6 py-4 backdrop-blur-xl"
                    }`}
                  >
                    <p className="whitespace-pre-wrap font-light leading-relaxed tracking-wide text-white/80">
                      {message.content}
                    </p>
                  </div>
                </div>
              );
            })}

            {streamingMessage ? (
              <div className="flex animate-[fadeIn_400ms_ease-out] justify-start">
                <div className="relative max-w-[85%] rounded-3xl border border-white/5 bg-white/[0.02] px-6 py-4 backdrop-blur-xl sm:max-w-[75%]">
                  <p className="whitespace-pre-wrap font-light leading-relaxed tracking-wide text-white/80">
                    {streamingMessage}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60" style={{ animationDelay: "0ms" }}></div>
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60" style={{ animationDelay: "200ms" }}></div>
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60" style={{ animationDelay: "400ms" }}></div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-2xl">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                placeholder="Message..."
                disabled={isStreaming}
                rows={1}
                className="max-h-32 min-h-[52px] w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-light tracking-wide text-white/90 backdrop-blur-xl placeholder:text-white/30 focus:border-white/20 focus:bg-white/10 focus:outline-none disabled:opacity-40"
                style={{ fieldSizing: "content" } as any}
              />
            </div>
            <button
              onClick={onSend}
              disabled={isStreaming || !inputValue.trim()}
              className="group flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:bg-white/20 active:scale-95 disabled:border-white/5 disabled:bg-white/5 disabled:opacity-40"
              aria-label="Send message"
            >
              {isStreaming ? (
                <div className="h-5 w-5 animate-spin rounded-full border border-white/20 border-t-white"></div>
              ) : (
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
