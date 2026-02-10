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
};

export default function Sidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
}: SidebarProps) {
  return (
    <aside className="hidden w-64 border-r border-black/10 p-4 md:block">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Chats</h1>
        <button
          className="rounded border border-black/20 px-2 py-1 text-sm"
          onClick={onNewConversation}
        >
          New
        </button>
      </div>
      <ul className="mt-4 space-y-2">
        {conversations.length === 0 ? (
          <li className="rounded border border-black/10 p-2 text-sm">
            No conversations yet
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
              >
                {conversation.title || "Untitled"}
              </button>
              <button
                className={`ml-2 text-xs ${
                  isSelected ? "text-white/70" : "text-black/60"
                }`}
                onClick={() => onDeleteConversation(conversation.id)}
              >
                Delete
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
