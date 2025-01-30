"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ChatParticipant } from "./ChatList";
import { ChatMessage } from "./ChatMessage";

type Message = {
  id: string;
  chat_id: string;
  profile_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
};

interface ChatInterfaceProps {
  chatId?: string;
  onOpenAddChat?: () => void;
  onBack?: () => void;
}

const MESSAGES_PER_PAGE = 20;

export function ChatInterface({
  chatId,
  onOpenAddChat,
  onBack,
}: ChatInterfaceProps) {
  const [chat, setChat] = useState<ChatParticipant | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load initial messages
  const loadMessages = async (isInitial = false) => {
    if (!chatId) return;

    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Get total count for pagination
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("chat_id", chatId);

      const from = isInitial
        ? Math.max((count || 0) - MESSAGES_PER_PAGE, 0)
        : Math.max((count || 0) - MESSAGES_PER_PAGE - messages.length, 0);

      const to = isInitial
        ? (count || 0) - 1
        : (count || 0) - messages.length - 1;

      const { data: newMessages, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true })
        .range(from, to);

      if (error) throw error;

      if (newMessages) {
        setMessages((prev) =>
          isInitial ? newMessages : [...newMessages, ...prev]
        );
        setHasMore(from > 0);
        // Only scroll to bottom on initial load
        if (isInitial) {
          setTimeout(scrollToBottom, 100);
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      if (isInitial) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  // Handle scroll to load more
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container || loadingMore || !hasMore) return;

    if (container.scrollTop <= 100) {
      loadMessages();
    }
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!chatId) {
      setChat(null);
      setMessages([]);
      setHasMore(true);
      return;
    }

    async function loadChat() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Get the other participant's profile
        const { data: otherParticipant } = await supabase
          .from("chat_participants")
          .select("profile_id")
          .eq("chat_id", chatId)
          .neq("profile_id", user.id)
          .single();

        if (!otherParticipant || !chatId) return;

        // Get their profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .eq("id", otherParticipant.profile_id)
          .single();

        setChat({
          chat_id: chatId,
          profiles: profile,
        });

        // Load initial messages
        await loadMessages(true);
      } catch (error) {
        console.error("Error loading chat:", error);
      }
    }

    loadChat();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => [...prev, payload.new as Message]);
            // Scroll to bottom for new messages
            scrollToBottom();
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.id ? (payload.new as Message) : msg
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      // Clear messages when changing chats
      setMessages([]);
    };
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!chatId || !newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("messages").insert([
        {
          chat_id: chatId,
          profile_id: user.id,
          content: newMessage.trim(),
        },
      ]);

      if (error) throw error;
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  if (!chatId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center flex flex-row items-center gap-3">
          <Image
            src={"/images/p.png"}
            height={"50"}
            width={"50"}
            alt="app logo"
            className="opacity-80"
          />
          <div className="flex flex-col items-start">
            <h3 className="text-lg leading-6 font-semibold">PotatoChat</h3>
            <button
              onClick={onOpenAddChat}
              className="text-sm leading-5 text-muted-foreground hover:text-foreground underline"
            >
              Start a conversation
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-sm text-muted-foreground">
          Loading chat...
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-sm text-muted-foreground">
          Chat not found
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="border-b p-4 fixed md:relative top-0 left-0 right-0 bg-background z-10  ">
        <div className="flex items-center gap-3">
          {/* Back button - only on mobile */}
          {chatId && onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 -ml-2 rounded-full hover:bg-accent"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}
          {chat?.profiles?.avatar_url ? (
            <Image
              src={chat.profiles.avatar_url}
              alt={chat.profiles.full_name || "User avatar"}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              {chat?.profiles
                ? (chat.profiles.full_name || chat.profiles.email)
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "??"}
            </div>
          )}
          <div>
            <div className="font-medium">
              {chat?.profiles?.full_name || "Anonymous User"}
            </div>
            <div className="text-xs text-muted-foreground">
              {chat?.profiles?.email || "No email"}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loadingMore && (
        <div className="absolute left-0 right-0 top-[72px] flex justify-center border-b bg-background/80 py-2 backdrop-blur-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {/* Chat Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        <div className="flex flex-col-reverse">
          <div className="space-y-1">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                created_at={message.created_at}
                is_edited={message.is_edited}
                isFromOtherUser={message.profile_id === chat?.profiles?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t p-4 fixed md:relative bottom-0 left-0 right-0 bg-background z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <button
            type="submit"
            disabled={sendingMessage || !newMessage.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
