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
}: ChatAreaProps) {
  return (
    <section className="flex min-h-screen flex-1 flex-col">
      <header className="border-b border-black/10 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <select
            className="rounded border border-black/20 px-2 py-1 text-sm"
            value={modelId}
            onChange={(event) => onModelChange(event.target.value)}
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
      <div className="flex-1 space-y-4 p-4">
        {messages.length === 0 && !streamingMessage ? (
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
          />
          <button
            className="rounded bg-black px-4 py-2 text-white disabled:bg-black/40"
            onClick={onSend}
            disabled={isStreaming}
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
