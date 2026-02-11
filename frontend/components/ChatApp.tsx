"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import ChatArea from "./ChatArea";
import Sidebar from "./Sidebar";
import ApiKeyModal from "./ApiKeyModal";
import { supabase } from "../lib/supabaseClient";

const defaultModel = "google/gemini-2.0-flash-exp:free";
const API_KEY_STORAGE_KEY = "chatbot:openrouter_api_key";

type Conversation = {
  id: string;
  title: string;
  model_id: string;
  created_at: string;
};

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

export default function ChatApp({ session }: { session: Session }) {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const storageKey = "chatbot:selectedConversationId";
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [input, setInput] = useState("");
  const [modelId, setModelId] = useState(defaultModel);
  const [isStreaming, setIsStreaming] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isRenamingConversation, setIsRenamingConversation] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const authHeader = useMemo(
    () => ({ Authorization: `Bearer ${session.access_token}` }),
    [session.access_token]
  );

  // Load API key from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (stored) {
      setApiKey(stored);
    } else {
      setShowApiKeyModal(true);
    }
  }, []);

  // Load models when API key changes
  useEffect(() => {
    if (apiKey) {
      loadModels();
    }
  }, [apiKey]);

  const loadModels = async () => {
    if (!apiKey) return;
    
    try {
      setIsLoadingModels(true);
      const response = await fetchWithRetry(`${apiBaseUrl}/api/models`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ api_key: apiKey }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const models = data.models.map((m: any) => ({
          id: m.id,
          name: m.name || m.id,
        }));
        setAvailableModels(models);
      }
    } catch (error) {
      console.error("Failed to load models:", error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  const handleCancelApiKey = () => {
    if (!apiKey) {
      // If no key exists, show a warning that they need one
      alert("An API key is required to use the chat.");
    }
    setShowApiKeyModal(false);
  };

  const fetchWithRetry = useCallback(
    async function fetchWithRetry(
      url: string,
      options: RequestInit,
      retries = 1
    ): Promise<Response> {
      try {
        return await fetch(url, options);
      } catch (error) {
        if (retries <= 0) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
        return fetchWithRetry(url, options, retries - 1);
      }
    },
    []
  );

  const loadConversations = useCallback(async () => {
    try {
      setApiError(null);
      setIsLoadingConversations(true);
      const response = await fetchWithRetry(`${apiBaseUrl}/api/conversations`, {
        headers: authHeader,
      });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as Conversation[];
      setConversations(data);
      if (data.length) {
        const storedId = localStorage.getItem(storageKey);
        const storedConversation = storedId
          ? data.find((item) => item.id === storedId)
          : undefined;
        if (!selectedConversationId && storedConversation) {
          setSelectedConversationId(storedConversation.id);
          setModelId(storedConversation.model_id || defaultModel);
          return;
        }
        if (!selectedConversationId) {
          setSelectedConversationId(data[0].id);
          setModelId(data[0].model_id || defaultModel);
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reach API";
      setApiError(message);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [apiBaseUrl, authHeader, fetchWithRetry, selectedConversationId]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      try {
        setApiError(null);
        setIsLoadingMessages(true);
        const response = await fetchWithRetry(
          `${apiBaseUrl}/api/conversations/${conversationId}/messages`,
          { headers: authHeader }
        );
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as Message[];
        setMessages(data || []);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to reach API";
        setApiError(message);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [apiBaseUrl, authHeader, fetchWithRetry]
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [loadMessages, selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId) {
      localStorage.setItem(storageKey, selectedConversationId);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [selectedConversationId, storageKey]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsSidebarOpen(false);
    const selected = conversations.find((item) => item.id === conversationId);
    if (selected?.model_id) {
      setModelId(selected.model_id);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      setApiError(null);
      await fetchWithRetry(`${apiBaseUrl}/api/conversations/${conversationId}`, {
        method: "DELETE",
        headers: authHeader,
      });
      setConversations((items) =>
        items.filter((item) => item.id !== conversationId)
      );
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reach API";
      setApiError(message);
    }
  };

  const handleNewConversation = async () => {
    if (isStreaming || isCreatingConversation) {
      return;
    }
    try {
      setApiError(null);
      setIsCreatingConversation(true);
      const response = await fetchWithRetry(`${apiBaseUrl}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({
          title: "New conversation",
          model_id: modelId || defaultModel,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }
      const data = (await response.json()) as Conversation;
      setConversations((items) => [data, ...items]);
      setSelectedConversationId(data.id);
      setIsSidebarOpen(false);
      setMessages([]);
      setModelId(data.model_id || defaultModel);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reach API";
      setApiError(message);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleRenameConversation = async (title: string) => {
    if (!selectedConversationId) {
      return;
    }
    try {
      setApiError(null);
      setIsRenamingConversation(true);
      const response = await fetchWithRetry(
        `${apiBaseUrl}/api/conversations/${selectedConversationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
          body: JSON.stringify({ title }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to rename conversation");
      }
      const data = (await response.json()) as Conversation;
      setConversations((items) =>
        items.map((item) => (item.id === data.id ? { ...item, ...data } : item))
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reach API";
      setApiError(message);
    } finally {
      setIsRenamingConversation(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((items) => [...items, userMessage]);
    setInput("");
    setStreamingMessage("");
    setIsStreaming(true);

    let response: Response;
    try {
      setApiError(null);
      response = await fetchWithRetry(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({
          message: userMessage.content,
          model_id: modelId,
          conversation_id: selectedConversationId,
          api_key: apiKey,
        }),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reach API";
      setApiError(message);
      setIsStreaming(false);
      return;
    }

    if (!response.ok) {
      setIsStreaming(false);
      setApiError("Failed to start chat stream");
      return;
    }

    if (!response.body) {
      setIsStreaming(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data: ")) {
          continue;
        }
        const payload = line.replace("data: ", "");
        try {
          const data = JSON.parse(payload) as {
            token?: string;
            done?: boolean;
            conversation_id?: string;
            error?: string;
          };
          if (data.error) {
            setIsStreaming(false);
            setApiError(data.error);
            return;
          }
          if (data.token) {
            setStreamingMessage((current) => current + data.token);
          }
          if (data.done) {
            if (data.conversation_id) {
              setSelectedConversationId(data.conversation_id);
            }
            setIsStreaming(false);
            await loadConversations();
            if (data.conversation_id) {
              await loadMessages(data.conversation_id);
            }
          }
        } catch {
          continue;
        }
      }
    }
  };

  const chatTitle = useMemo(() => {
    const current = conversations.find(
      (item) => item.id === selectedConversationId
    );
    return current?.title || "New Conversation";
  }, [conversations, selectedConversationId]);

  const hasConversation = Boolean(selectedConversationId);

  return (
    <main className="flex h-screen overflow-hidden bg-black">
      {showApiKeyModal && (
        <ApiKeyModal
          onSave={handleSaveApiKey}
          onCancel={handleCancelApiKey}
          currentKey={apiKey || undefined}
        />
      )}
      {apiError ? (
        <div className="absolute left-1/2 top-6 z-40 w-full max-w-2xl -translate-x-1/2 px-4">
          <div className="animate-[slideDown_300ms_ease-out] rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 backdrop-blur-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="mb-1 text-sm font-light tracking-wide text-red-300">Connection Error</h4>
                <p className="text-xs font-light tracking-wide text-red-400/80">
                  {apiError}. Backend: <code className="rounded bg-red-500/10 px-1.5 py-0.5 font-mono">{apiBaseUrl}</code>
                </p>
              </div>
              <button
                onClick={loadConversations}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-light tracking-wider text-red-300 transition-all hover:bg-red-500/20"
              >
                RETRY
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex h-full w-full overflow-hidden">
        <Sidebar
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onNewConversation={handleNewConversation}
          onSignOut={handleSignOut}
          isLoading={isLoadingConversations}
          isCreating={isCreatingConversation}
          className="hidden lg:flex"
          userEmail={session.user.email}
        />
        {isSidebarOpen ? (
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:hidden ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
            onNewConversation={handleNewConversation}
            onSignOut={handleSignOut}
            isLoading={isLoadingConversations}
            isCreating={isCreatingConversation}
            showClose
            onClose={() => setIsSidebarOpen(false)}
            userEmail={session.user.email}
          />
        </div>
        <ChatArea
          title={chatTitle}
          modelId={modelId}
          onModelChange={setModelId}
          messages={messages}
          streamingMessage={streamingMessage}
          inputValue={input}
          onInputChange={setInput}
          onSend={handleSend}
          isStreaming={isStreaming}
          isLoadingMessages={isLoadingMessages}
          hasConversation={hasConversation}
          canRename={Boolean(selectedConversationId)}
          isRenaming={isRenamingConversation}
          onRenameConversation={handleRenameConversation}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          availableModels={availableModels}
          isLoadingModels={isLoadingModels}
          onOpenApiKeySettings={() => setShowApiKeyModal(true)}
        />
      </div>
    </main>
  );
}
