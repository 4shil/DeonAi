import { useEffect, useState } from "react";

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
}: ChatAreaProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  useEffect(() => {
    setDraftTitle(title);
  }, [title]);

  const handleSaveTitle = async () => {
    const nextTitle = draftTitle.trim();
    if (!nextTitle || !canRename) {
      return;
    }
    await onRenameConversation(nextTitle);
    setIsEditingTitle(false);
  };

  return (
    <section className="flex min-h-screen flex-1 flex-col bg-white/50">
      <header className="border-b border-black/10 bg-white/70 p-4 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs md:hidden"
              onClick={onOpenSidebar}
              aria-label="Open sidebar"
            >
              Menu
            </button>
            {isEditingTitle ? (
              <input
                className="rounded-xl border border-black/15 bg-white/80 px-3 py-1.5 text-sm"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                aria-label="Conversation title"
                maxLength={120}
              />
            ) : (
              <h2 className="text-lg font-semibold">{title}</h2>
            )}
            {canRename ? (
              isEditingTitle ? (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    className="rounded-full border border-black/15 bg-white/80 px-3 py-1"
                    onClick={handleSaveTitle}
                    disabled={isRenaming}
                    aria-label="Save conversation title"
                  >
                    {isRenaming ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="rounded-full border border-black/10 px-3 py-1"
                    onClick={() => {
                      setDraftTitle(title);
                      setIsEditingTitle(false);
                    }}
                    aria-label="Cancel renaming"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="rounded-full border border-black/15 bg-white/80 px-3 py-1 text-xs"
                  onClick={() => setIsEditingTitle(true)}
                  aria-label="Rename conversation"
                >
                  Rename
                </button>
              )
            ) : null}
          </div>
          <select
            className="rounded-full border border-black/15 bg-white/80 px-3 py-1 text-xs"
            value={modelId}
            onChange={(event) => onModelChange(event.target.value)}
            aria-label="Select model"
          >
            <option value="google/gemini-2.0-flash-exp:free">
              gemini-2.0-flash-exp:free
            </option>
            <option value="meta-llama/llama-3-8b-instruct:free">
              llama-3-8b-instruct:free
            </option>
          </select>
        </div>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {!hasConversation && !isLoadingMessages ? (
          <div className="max-w-2xl rounded-2xl border border-black/10 bg-white/80 p-4 text-sm">
            Start a new conversation from the sidebar.
          </div>
        ) : null}
        {isLoadingMessages ? (
          <div className="max-w-2xl rounded-2xl border border-black/10 bg-white/80 p-4 text-sm">
            Loading messages...
          </div>
        ) : null}
        {hasConversation && messages.length === 0 && !streamingMessage ? (
          <div className="max-w-2xl rounded-2xl border border-black/10 bg-white/80 p-4 text-sm">
            Ask me anything to get started.
          </div>
        ) : null}
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-2xl rounded-2xl border px-4 py-3 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.1)] ${
                  isUser
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white/90"
                }`}
              >
                {message.content}
              </div>
            </div>
          );
        })}
        {streamingMessage ? (
          <div className="flex justify-start">
            <div className="max-w-2xl rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.1)]">
              {streamingMessage}
            </div>
          </div>
        ) : null}
      </div>
      <div className="border-t border-black/10 bg-white/80 p-4">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border border-black/15 bg-white/80 px-3 py-2.5 text-sm"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            aria-label="Message input"
            maxLength={4000}
          />
          <button
            className="rounded-xl bg-[#ff6b00] px-4 py-2.5 text-sm text-black shadow-[0_10px_25px_rgba(255,107,0,0.35)] disabled:bg-black/40"
            onClick={onSend}
            disabled={isStreaming}
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
