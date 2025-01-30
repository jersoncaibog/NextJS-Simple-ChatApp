"use client";

import { UserMenu } from "@/components/user/UserMenu";
import { useCallback, useState } from "react";
import { GoPlus } from "react-icons/go";
import { AddChatDialog } from "./AddChatDialog";
import { ChatList } from "./ChatList";

interface ChatSidebarProps {
  activeChat?: string;
  onChatSelect: (chatId: string) => void;
  addDialogOpen: boolean;
  onOpenAddChat: () => void;
}

export function ChatSidebar({
  activeChat,
  onChatSelect,
  addDialogOpen,
  onOpenAddChat,
}: ChatSidebarProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleChatCreated = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    onOpenAddChat();
  }, [onOpenAddChat]);

  return (
    <>
      <div className="p-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <UserMenu />
          <h1 className="select-none font-bold text-foreground">Chats</h1>
        </div>
        <button
          onClick={onOpenAddChat}
          className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <GoPlus className="w-6 h-6" />
        </button>
      </div>

      <AddChatDialog
        open={addDialogOpen}
        onOpenChange={onOpenAddChat}
        onChatCreated={handleChatCreated}
      />
      <ChatList
        key={refreshKey}
        activeChat={activeChat}
        onChatSelect={onChatSelect}
      />
    </>
  );
}
