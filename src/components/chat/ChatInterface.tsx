"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useEffect, useState } from "react";
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
}

export function ChatInterface({ chatId, onOpenAddChat }: ChatInterfaceProps) {
  const [chat, setChat] = useState<ChatParticipant | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Load chat and messages
  useEffect(() => {
    if (!chatId) {
      setChat(null);
      setMessages([]);
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

        // Load messages
        const { data: messages } = await supabase
          .from("messages")
          .select("*")
          .eq("chat_id", chatId)
          .order("created_at", { ascending: true });

        if (messages) {
          setMessages(messages);
        }
      } catch (error) {
        console.error("Error loading chat:", error);
      } finally {
        setLoading(false);
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
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          {chat.profiles?.avatar_url ? (
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
              {chat.profiles
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
              {chat.profiles?.full_name || "Anonymous User"}
            </div>
            <div className="text-xs text-muted-foreground">
              {chat.profiles?.email || "No email"}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              created_at={message.created_at}
              is_edited={message.is_edited}
              isFromOtherUser={message.profile_id === chat.profiles?.id}
            />
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
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
