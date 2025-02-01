"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const [activeChatId, setActiveChatId] = useState<string>();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAddChat, setShowAddChat] = useState(false);

  // Reset showSidebar when activeChatId changes
  useEffect(() => {
    setShowSidebar(!activeChatId);
  }, [activeChatId]);

  return (
    <div className="flex h-screen">
      {/* Sidebar - Full width on mobile when no active chat or when showSidebar is true */}
      <div
        className={`${
          showSidebar ? "flex" : "hidden md:flex"
        } w-full md:w-80 flex-col border-r bg-background`}
      >
        <ChatSidebar
          activeChat={activeChatId}
          onChatSelect={(chatId) => {
            setActiveChatId(chatId);
            setShowSidebar(false);
          }}
          addDialogOpen={showAddChat}
          onAddDialogOpenChange={setShowAddChat}
        />
      </div>

      {/* Main Chat Interface - Full width on mobile when active and showSidebar is false */}
      <main
        className={`${
          !showSidebar ? "flex" : "hidden md:flex"
        } flex-1 flex-col`}
      >
        <ChatInterface
          chatId={activeChatId}
          onBack={() => setShowSidebar(true)}
          onOpenAddChat={() => setShowAddChat(true)}
        />
      </main>
    </div>
  );
}
