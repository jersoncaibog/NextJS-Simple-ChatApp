"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useEffect, useState } from "react";

export type ChatParticipant = {
  chat_id: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
};

interface ChatListProps {
  activeChat?: string;
  onChatSelect: (chatId: string) => void;
}

export function ChatList({ activeChat, onChatSelect }: ChatListProps) {
  const [chats, setChats] = useState<ChatParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Get all chats where the current user is a participant
        const { data: userChats } = await supabase
          .from("chat_participants")
          .select("chat_id")
          .eq("profile_id", user.id);

        if (!userChats) return;

        // For each chat, get the other participant's profile
        const chatPromises = userChats.map(async (chat) => {
          // First get the other participant's ID
          const { data: otherParticipant } = await supabase
            .from("chat_participants")
            .select("profile_id")
            .eq("chat_id", chat.chat_id)
            .neq("profile_id", user.id)
            .single();

          if (!otherParticipant) return null;

          // Then get their profile data
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .eq("id", otherParticipant.profile_id)
            .single();

          return {
            chat_id: chat.chat_id,
            profiles: profile,
          } satisfies ChatParticipant;
        });

        const resolvedChats = (await Promise.all(chatPromises)).filter(
          (chat): chat is ChatParticipant => chat !== null
        );
        setChats(resolvedChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
        Loading chats...
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
        No chats yet. <br /> Start a new conversation!
      </div>
    );
  }

  return (
    <div className="px-2">
      <div className="space-y-1">
        {chats.map((chat) => (
          <button
            key={chat.chat_id}
            onClick={() => onChatSelect(chat.chat_id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors ${
              activeChat === chat.chat_id ? "bg-accent" : "hover:bg-accent/50"
            }`}
          >
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
            <div className="flex-1 text-left">
              <div className="font-medium">
                {chat.profiles?.full_name || "Anonymous User"}
              </div>
              <div className="text-xs text-muted-foreground">
                {chat.profiles?.email || "No email"}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
