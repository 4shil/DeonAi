"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import ChatArea from "./ChatArea";
import Sidebar from "./Sidebar";

const defaultModel = "google/gemini-2.0-flash-exp:free";

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

  const authHeader = useMemo(
    () => ({ Authorization: `Bearer ${session.access_token}` }),
    [session.access_token]
  );

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
    <main className="min-h-screen bg-white text-black">
      {apiError ? (
        <div className="border-b border-black/10 bg-amber-50 px-4 py-2 text-xs text-amber-900">
          <div className="flex items-center justify-between gap-2">
            <span>
              API error: {apiError}. Check that the backend is running at
              {" "}
              {apiBaseUrl}.
            </span>
            <button
              className="rounded border border-amber-200 bg-white px-2 py-1 text-[11px]"
              onClick={loadConversations}
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}
      <div className="flex min-h-screen">
        <Sidebar
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onNewConversation={handleNewConversation}
          isLoading={isLoadingConversations}
          isCreating={isCreatingConversation}
        />
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
          canRename={hasConversation}
          isRenaming={isRenamingConversation}
          onRenameConversation={handleRenameConversation}
        />
      </div>
    </main>
  );
}
