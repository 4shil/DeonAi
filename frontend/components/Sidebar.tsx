type Conversation = {
  id: string;
  title: string;
};

type SidebarProps = {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewConversation: () => void;
  onSignOut: () => void;
  isLoading: boolean;
  isCreating: boolean;
  className?: string;
  showClose?: boolean;
  onClose?: () => void;
  userEmail?: string | null;
};

export default function Sidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
  onSignOut,
  isLoading,
  isCreating,
  className,
  showClose,
  onClose,
  userEmail,
}: SidebarProps) {
  return (
    <aside
      className={`w-72 border-r border-black/10 bg-white/70 p-4 backdrop-blur ${
        className ?? ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
            Workspace
          </p>
          <h1 className="text-lg font-semibold">Conversations</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-black/15 bg-white/80 px-3 py-1 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.12)]"
            onClick={onNewConversation}
            disabled={isCreating}
            aria-label="Start a new conversation"
          >
            {isCreating ? "Creating..." : "New"}
          </button>
          {showClose ? (
            <button
              className="rounded-full border border-black/10 px-3 py-1 text-sm"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {isLoading ? (
          <li className="rounded-2xl border border-black/10 bg-white/80 p-3 text-sm">
            Loading conversations...
          </li>
        ) : null}
        {!isLoading && conversations.length === 0 ? (
          <li className="rounded-2xl border border-black/10 bg-white/80 p-3 text-sm">
            No conversations yet. Start one with the New button.
          </li>
        ) : null}
        {conversations.map((conversation) => {
          const isSelected = conversation.id === selectedConversationId;
          return (
            <li
              key={conversation.id}
              className={`flex items-center justify-between rounded-2xl border p-3 text-sm transition ${
                isSelected
                  ? "border-black bg-black text-white shadow-[0_14px_30px_rgba(15,23,42,0.2)]"
                  : "border-black/10 bg-white/80 hover:border-black/30"
              }`}
            >
              <button
                className="flex-1 text-left"
                onClick={() => onSelectConversation(conversation.id)}
                aria-label={`Open conversation ${conversation.title || "Untitled"}`}
              >
                {conversation.title || "Untitled"}
              </button>
              <button
                className={`ml-2 text-xs ${
                  isSelected ? "text-white/70" : "text-black/50"
                }`}
                onClick={() => onDeleteConversation(conversation.id)}
                aria-label={`Delete conversation ${conversation.title || "Untitled"}`}
              >
                Delete
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 border-t border-black/10 pt-4 text-xs text-black/70">
        {userEmail ? (
          <p className="truncate">Signed in as {userEmail}</p>
        ) : null}
        <button
          className="mt-2 rounded-full border border-black/15 bg-white/80 px-3 py-1 text-xs"
          onClick={onSignOut}
          aria-label="Sign out"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
