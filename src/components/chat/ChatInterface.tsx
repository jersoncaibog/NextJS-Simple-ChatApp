"use client";

import { Header } from "@/components/layout/Header";
import { useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatSidebar } from "./ChatSidebar";

export function ChatInterface() {
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      message: string;
      isUser: boolean;
      timestamp: string;
    }>
  >([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
  };

  // Placeholder for the active conversation's profile picture, user name, and status
  const activeProfilePicture = ""; // No image provided
  const activeUserName = "John Doe"; // Replace with actual user name
  const activeStatus = "Active now"; // Replace with actual status

  return (
    <div className="flex h-screen">
      <div className="flex w-64 flex-col border-r bg-gray-50">
        <ChatSidebar />
      </div>
      <main className="flex flex-1 flex-col">
        <Header
          profilePicture={activeProfilePicture}
          userName={activeUserName}
          activeStatus={activeStatus} // Pass the active status
        />
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg.message}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
            />
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border p-2 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
