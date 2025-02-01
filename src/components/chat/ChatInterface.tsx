"use client";

import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
  status?: "sending" | "sent";
};

type ChatParticipantResponse = {
  chat_id: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
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
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   console.log("chat:");
  //   console.log(chat);
  // }, [chat]);

  // useEffect(() => {
  //   if (editingMessage && inputRef.current) {
  //     inputRef.current.focus();
  //   }
  // }, [editingMessage]);

  useEffect(() => {
    const input = inputRef.current;

    if (editingMessage && input && input.value.length > 0) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [inputRef, editingMessage]);

  // Memoize scrollToBottom function
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;

    if (container.scrollTop < 100 && !loadingMore && hasMore) {
      setLoadingMore(true);

      try {
        console.log("loading more messages");

        const oldestMessage = messages[0];
        if (!oldestMessage) return;

        // Get messages older than our oldest message
        const { data: olderMessages, error } = await supabase
          .from("messages")
          .select("*")
          .eq("chat_id", chatId)
          .lt("created_at", oldestMessage.created_at)
          .order("created_at", { ascending: false })
          .limit(MESSAGES_PER_PAGE);

        if (error) throw error;

        if (olderMessages && olderMessages.length > 0) {
          const scrollHeight = container.scrollHeight;

          // Filter out any duplicate messages
          const newMessages = olderMessages
            .filter((oldMsg) => !messages.some((msg) => msg.id === oldMsg.id))
            .reverse();

          if (newMessages.length > 0) {
            setMessages((prev) => [...newMessages, ...prev]);
            setHasMore(olderMessages.length === MESSAGES_PER_PAGE);

            requestAnimationFrame(() => {
              container.scrollTop = container.scrollHeight - scrollHeight;
            });
          } else {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error loading more messages:", error);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  // Load initial messages
  const loadInitialMessages = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);

    try {
      const { data: initialMessages, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: false })
        .limit(MESSAGES_PER_PAGE);

      if (error) throw error;

      if (initialMessages) {
        setMessages(initialMessages.reverse());
        setHasMore(initialMessages.length === MESSAGES_PER_PAGE);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  // Load chat details and initial messages
  useEffect(() => {
    async function loadChat() {
      if (!chatId) return;

      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (!currentUser) return;

        const { data: chat, error } = (await supabase
          .from("chat_participants")
          .select(
            `
            chat_id,
            profiles!chat_participants_profile_id_fkey (
              id,
              full_name,
              email,
              avatar_url
            )
          `
          )
          .eq("chat_id", chatId)
          .neq("profile_id", currentUser.id)
          .single()) as {
          data: ChatParticipantResponse | null;
          error: PostgrestError | null;
        };

        if (error) throw error;

        if (chat?.profiles) {
          setChat({
            chat_id: chatId,
            profiles: {
              id: String(chat.profiles.id),
              full_name: chat.profiles.full_name || null,
              email: String(chat.profiles.email),
              avatar_url: chat.profiles.avatar_url || null,
            },
          });
        }
      } catch (error) {
        console.error("Error loading chat:", error);
      }
    }

    setMessages([]);
    loadChat();
    loadInitialMessages();

    return () => {
      setChat(null);
      setMessages([]);
      setHasMore(true);
    };
  }, [chatId, loadInitialMessages]);

  // Subscribe to new messages
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((current) => [...current, newMessage]);
          requestAnimationFrame(() => {
            requestAnimationFrame(scrollToBottom);
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((current) =>
            current.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId || !newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    const tempId = crypto.randomUUID();
    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      if (editingMessage) {
        // Update existing message
        const response = await fetch("/api/messages", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingMessage.id,
            content: messageContent,
          }),
        });

        if (!response.ok) throw new Error("Failed to update message");
        setEditingMessage(null);
      } else {
        // Add temporary message immediately
        const tempMessage: Message = {
          id: tempId,
          chat_id: chatId,
          content: messageContent,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_edited: false,
          profile_id: (await supabase.auth.getUser()).data.user?.id || "",
          status: "sending",
        };
        setMessages((prev) => [...prev, tempMessage]);
        scrollToBottom();

        // Send new message
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("User not found");

        const { error } = await supabase.from("messages").insert([
          {
            chat_id: chatId,
            profile_id: user.id,
            content: messageContent,
          },
        ]);

        if (error) throw error;

        // Update temporary message to sent status
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, status: "sent" } : msg
          )
        );
      }
      scrollToBottom();
    } catch (error) {
      console.error("Error sending/updating message:", error);
      // Remove temporary message if sending failed
      if (!editingMessage) {
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      }
      setNewMessage(messageContent); // Restore the message content
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartEditing = (message: Message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
    console.log("editing message");
    console.log(inputRef.current);
    inputRef.current?.focus();
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setNewMessage("");
  };

  useEffect(() => {
    if (chat) {
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    }
  }, [chat, scrollToBottom]);

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
            {onOpenAddChat && (
              <button
                onClick={onOpenAddChat}
                className="text-sm leading-5 text-muted-foreground hover:text-foreground underline"
              >
                Start a conversation
              </button>
            )}
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
      <div className="border-b p-4 bg-background fixed md:relative top-0 right-0 left-0 z-10">
        <div className="flex items-center gap-3">
          {/* Back button - only on mobile */}
          {onBack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              type="button"
              className="md:hidden -ml-2 p-3 rounded-full hover:bg-accent touch-manipulation z-10"
              aria-label="Go back to chat list"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none"
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
        
        {/* Loading Spinner */}
        <div
          className={`absolute left-0 right-0 top-[72px] flex justify-center border-b bg-background/80 py-2 backdrop-blur-sm transition-all duration-200 ${
            loadingMore
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-full"
          }`}
        >
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>


      {/* Chat Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-20 md:p-4 scroll-smooth "
        onScroll={handleScroll}
      >
        <div className="flex flex-col justify-end min-h-full">
          <div className="space-y-1.5 ">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                content={message.content}
                created_at={message.created_at}
                is_edited={message.is_edited}
                isFromOtherUser={message.profile_id === chat?.profiles?.id}
                profile_id={message.profile_id}
                onMessageDeleted={() => {
                  setMessages((prev) =>
                    prev.filter((msg) => msg.id !== message.id)
                  );
                  if (editingMessage?.id === message.id) {
                    cancelEditing();
                  }
                }}
                onEdit={() => handleStartEditing(message)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t p-4 bg-background fixed md:static bottom-0 right-0 left-0"
      >
        {editingMessage && (
          <span className="text-xs text-muted-foreground">Edit message</span>
        )}
        <div className={`flex gap-2 ${editingMessage ? "mt-4" : ""}`}>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
            }}
            placeholder={editingMessage ? "Edit message" : "Type a message"}
            className={`flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors duration-200`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              } else if (e.key === "Escape" && editingMessage) {
                setEditingMessage(null);
                setNewMessage("");
              }
            }}
          />
          {editingMessage && (
            <button
              onClick={() => {
                setEditingMessage(null);
                setNewMessage("");
              }}
              className="rounded-md px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all duration-200"
          >
            {editingMessage ? "Save" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
