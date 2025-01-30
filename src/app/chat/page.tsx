"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useState } from "react";

export default function ChatPage() {
  const [activeChatId, setActiveChatId] = useState<string>();

  return (
    <div className="flex h-screen">
      {/* Sidebar - Full width on mobile when no active chat */}
      <div
        className={`${
          activeChatId ? "hidden md:flex" : "flex"
        } w-full md:w-80 flex-col border-r bg-background`}
      >
        <ChatSidebar activeChat={activeChatId} onChatSelect={setActiveChatId} />
      </div>

      {/* Main Chat Interface - Full width on mobile when active */}
      <main
        className={`${
          activeChatId ? "flex" : "hidden md:flex"
        } flex-1 flex-col`}
      >
        <ChatInterface
          chatId={activeChatId}
          onBack={() => setActiveChatId(undefined)}
        />
      </main>
    </div>
  );
}
