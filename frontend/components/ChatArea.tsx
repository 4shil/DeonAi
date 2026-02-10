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
    <section className="flex min-h-screen flex-1 flex-col">
      <header className="border-b border-black/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="rounded border border-black/10 px-2 py-1 text-xs md:hidden"
              onClick={onOpenSidebar}
              aria-label="Open sidebar"
            >
              Menu
            </button>
            {isEditingTitle ? (
              <input
                className="rounded border border-black/20 px-2 py-1 text-sm"
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
                    className="rounded border border-black/20 px-2 py-1"
                    onClick={handleSaveTitle}
                    disabled={isRenaming}
                    aria-label="Save conversation title"
                  >
                    {isRenaming ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="rounded border border-black/10 px-2 py-1"
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
                  className="rounded border border-black/20 px-2 py-1 text-xs"
                  onClick={() => setIsEditingTitle(true)}
                  aria-label="Rename conversation"
                >
                  Rename
                </button>
              )
            ) : null}
          </div>
          <select
            className="rounded border border-black/20 px-2 py-1 text-sm"
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
      <div className="flex-1 space-y-4 p-4" aria-live="polite">
        {!hasConversation && !isLoadingMessages ? (
          <div className="max-w-2xl rounded border border-black/10 p-3">
            <p className="text-sm">
              Start a new conversation from the sidebar.
            </p>
          </div>
        ) : null}
        {isLoadingMessages ? (
          <div className="max-w-2xl rounded border border-black/10 p-3">
            <p className="text-sm">Loading messages...</p>
          </div>
        ) : null}
        {hasConversation && messages.length === 0 && !streamingMessage ? (
          <div className="max-w-2xl rounded border border-black/10 p-3">
            <p className="text-sm">Ask me anything to get started.</p>
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
                className={`max-w-2xl rounded border p-3 text-sm ${
                  isUser
                    ? "border-black bg-black text-white"
                    : "border-black/10"
                }`}
              >
                {message.content}
              </div>
            </div>
          );
        })}
        {streamingMessage ? (
          <div className="flex justify-start">
            <div className="max-w-2xl rounded border border-black/10 p-3 text-sm">
              {streamingMessage}
            </div>
          </div>
        ) : null}
      </div>
      <div className="border-t border-black/10 p-4">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded border border-black/20 px-3 py-2"
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
            className="rounded bg-black px-4 py-2 text-white disabled:bg-black/40"
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
