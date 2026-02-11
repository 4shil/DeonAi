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

  useEffect(() => {
    setDraftTitle(title);
  }, [title]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  const handleSaveTitle = async () => {
    const nextTitle = draftTitle.trim();
    if (!nextTitle || !canRename) {
      return;
    }
    await onRenameConversation(nextTitle);
    setIsEditingTitle(false);
  };

  return (
    <section className="flex h-screen flex-1 flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Menu & Title */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <button
                onClick={onOpenSidebar}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 lg:hidden"
                aria-label="Open sidebar"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {isEditingTitle ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    maxLength={120}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    disabled={isRenaming}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isRenaming ? "..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setDraftTitle(title);
                      setIsEditingTitle(false);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                    {title}
                  </h1>
                  {canRename && (
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="flex-shrink-0 text-slate-400 transition-colors hover:text-slate-600"
                      aria-label="Edit title"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
                aria-label="API Settings"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="hidden sm:inline">Key</span>
              </button>

              <select
                value={modelId}
                onChange={(e) => onModelChange(e.target.value)}
                disabled={isLoadingModels}
                className="h-9 max-w-[140px] truncate rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-all hover:bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 sm:max-w-[200px]"
              >
                {isLoadingModels ? (
                  <option>Loading...</option>
                ) : availableModels.length > 0 ? (
                  availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash</option>
                    <option value="meta-llama/llama-3-8b-instruct:free">Llama 3 8B</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {!hasConversation && !isLoadingMessages ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-bold text-slate-900">Start a conversation</h2>
                <p className="text-sm text-slate-500">Select a conversation from the sidebar or create a new one</p>
              </div>
            </div>
          ) : null}

          {isLoadingMessages ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-3 shadow-sm">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
                <span className="text-sm text-slate-600">Loading messages...</span>
              </div>
            </div>
          ) : null}

          {hasConversation && messages.length === 0 && !streamingMessage && !isLoadingMessages ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-bold text-slate-900">Ready to chat!</h2>
                <p className="text-sm text-slate-500">Ask me anything to get started</p>
              </div>
            </div>
          ) : null}

          <div className="space-y-6">
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`group relative max-w-[85%] rounded-2xl px-4 py-3 shadow-sm transition-all sm:max-w-[75%] ${
                      isUser
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                        : "border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
                      {message.content}
                    </p>
                  </div>
                </div>
              );
            })}

            {streamingMessage ? (
              <div className="flex justify-start">
                <div className="group relative max-w-[85%] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:max-w-[75%]">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 sm:text-base">
                    {streamingMessage}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: "0ms" }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: "150ms" }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="flex items-end gap-2">
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
                placeholder="Type your message..."
                disabled={isStreaming}
                rows={1}
                className="max-h-32 min-h-[44px] w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                style={{ fieldSizing: "content" } as any}
              />
            </div>
            <button
              onClick={onSend}
              disabled={isStreaming || !inputValue.trim()}
              className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none"
              aria-label="Send message"
            >
              {isStreaming ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
