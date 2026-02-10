"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import ChatArea from "./ChatArea";
import Sidebar from "./Sidebar";
import { supabase } from "../lib/supabaseClient";

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [input, setInput] = useState("");
  const [modelId, setModelId] = useState(defaultModel);
  const [isStreaming, setIsStreaming] = useState(false);

  const authHeader = useMemo(
    () => ({ Authorization: `Bearer ${session.access_token}` }),
    [session.access_token]
  );

  const loadConversations = useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/api/conversations`, {
      headers: authHeader,
    });
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as Conversation[];
    setConversations(data);
    if (!selectedConversationId && data.length) {
      setSelectedConversationId(data[0].id);
      setModelId(data[0].model_id || defaultModel);
    }
  }, [apiBaseUrl, authHeader, selectedConversationId]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at");
      setMessages((data as Message[]) || []);
    },
    []
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

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    const selected = conversations.find((item) => item.id === conversationId);
    if (selected?.model_id) {
      setModelId(selected.model_id);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    await fetch(`${apiBaseUrl}/api/conversations/${conversationId}`, {
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
  };

  const handleNewConversation = () => {
    setSelectedConversationId(null);
    setMessages([]);
    setModelId(defaultModel);
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

    const response = await fetch(`${apiBaseUrl}/api/chat`, {
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

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="flex min-h-screen">
        <Sidebar
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onNewConversation={handleNewConversation}
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
        />
      </div>
    </main>
  );
}
