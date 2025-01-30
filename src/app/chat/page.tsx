"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useState } from "react";

export default function ChatPage() {
  const [activeChatId, setActiveChatId] = useState<string>();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="flex w-80 flex-col border-r bg-background">
        <ChatSidebar
          activeChat={activeChatId}
          onChatSelect={setActiveChatId}
          addDialogOpen={addDialogOpen}
          onOpenAddChat={() => setAddDialogOpen((prev) => !prev)}
        />
      </div>

      {/* Main Chat Interface */}
      <main className="flex flex-1 flex-col">
        <ChatInterface
          chatId={activeChatId}
          onOpenAddChat={() => setAddDialogOpen((prev) => !prev)}
        />
      </main>
    </div>
  );
}
