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
      className={`w-64 border-r border-black/10 bg-white p-4 ${
        className ?? ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Chats</h1>
        <div className="flex items-center gap-2">
          <button
            className="rounded border border-black/20 px-2 py-1 text-sm"
            onClick={onNewConversation}
            disabled={isCreating}
            aria-label="Start a new conversation"
          >
            {isCreating ? "Creating..." : "New"}
          </button>
          {showClose ? (
            <button
              className="rounded border border-black/10 px-2 py-1 text-sm"
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
          <li className="rounded border border-black/10 p-2 text-sm">
            Loading conversations...
          </li>
        ) : null}
        {!isLoading && conversations.length === 0 ? (
          <li className="rounded border border-black/10 p-2 text-sm">
            No conversations yet. Start one with the New button.
          </li>
        ) : null}
        {conversations.map((conversation) => {
          const isSelected = conversation.id === selectedConversationId;
          return (
            <li
              key={conversation.id}
              className={`flex items-center justify-between rounded border p-2 text-sm ${
                isSelected ? "border-black bg-black text-white" : "border-black/10"
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
                  isSelected ? "text-white/70" : "text-black/60"
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
        {userEmail ? <p className="truncate">Signed in as {userEmail}</p> : null}
        <button
          className="mt-2 rounded border border-black/20 px-2 py-1 text-xs"
          onClick={onSignOut}
          aria-label="Sign out"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
