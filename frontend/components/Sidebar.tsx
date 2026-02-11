"use client";

import { useState } from "react";

type Conversation = {
  id: string;
  title: string;
  created_at: string;
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
  className = "",
  showClose = false,
  onClose,
  userEmail,
}: SidebarProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      onDeleteConversation(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <aside
      className={`flex w-full flex-col border-r border-white/5 bg-black/40 backdrop-blur-2xl lg:w-80 ${className}`}
    >
      {/* Header */}
      <div className="border-b border-white/5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h2 className="font-light tracking-wider text-white">DEON<span className="text-white/40">AI</span></h2>
              <p className="text-xs font-light tracking-wider text-white/40">ASSISTANT</p>
            </div>
          </div>
          {showClose && onClose && (
            <button
              onClick={onClose}
              className="group flex h-9 w-9 items-center justify-center rounded-full opacity-40 transition-all duration-300 hover:bg-white/5 hover:opacity-100"
              aria-label="Close sidebar"
            >
              <svg className="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          onClick={onNewConversation}
          disabled={isCreating}
          className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-light tracking-wider backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:bg-white/20 active:scale-95 disabled:border-white/10 disabled:bg-white/5 disabled:opacity-40"
        >
          {isCreating ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border border-white/20 border-t-white"></div>
              <span className="text-xs">CREATING...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs">NEW CHAT</span>
            </>
          )}
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 font-light text-sm tracking-wide text-white/40">
              <div className="h-4 w-4 animate-spin rounded-full border border-white/20 border-t-white"></div>
              <span>Loading...</span>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl">
              <svg className="h-7 w-7 text-white/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-light text-sm tracking-wide text-white/40">No conversations</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const isSelected = selectedConversationId === conv.id;
              const isDeleting = confirmDelete === conv.id;

              return (
                <div
                  key={conv.id}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    isSelected
                      ? "border border-white/20 bg-white/10"
                      : "border border-transparent hover:border-white/10 hover:bg-white/5"
                  }`}
                >
                  <button
                    onClick={() => onSelectConversation(conv.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isSelected
                          ? "border border-white/20 bg-white/10"
                          : "border border-white/10 bg-white/5"
                      }`}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate font-light tracking-wide ${
                          isSelected ? "text-white" : "text-white/70"
                        }`}
                      >
                        {conv.title}
                      </p>
                      <p className="text-xs font-light tracking-wide text-white/30">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDelete(conv.id)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 transition-all duration-300 ${
                      isDeleting
                        ? "bg-red-500/20 text-red-400 opacity-100"
                        : "bg-white/5 text-white/40 opacity-0 backdrop-blur-xl group-hover:opacity-100 hover:bg-white/10 hover:text-white/80"
                    }`}
                    aria-label={isDeleting ? "Click to confirm" : "Delete"}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 p-4">
        <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-light tracking-wide text-white/80">{userEmail || "User"}</p>
              <p className="text-xs font-light tracking-wider text-white/30">ACTIVE</p>
            </div>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-light tracking-wider backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 active:scale-95"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-xs">SIGN OUT</span>
        </button>
      </div>
    </aside>
  );
}
