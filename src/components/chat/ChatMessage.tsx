"use client";

import { useState } from "react";

interface ChatMessageProps {
  content: string;
  created_at: string;
  is_edited: boolean;
  isFromOtherUser: boolean;
}

export function ChatMessage({
  content,
  created_at,
  is_edited,
  isFromOtherUser,
}: ChatMessageProps) {
  const [showTime, setShowTime] = useState(false);

  return (
    <div
      className={`flex ${isFromOtherUser ? "justify-start" : "justify-end"}`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setShowTime(!showTime)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setShowTime(!showTime);
          }
        }}
        className={`rounded-lg px-5 py-2 max-w-[70%] cursor-pointer ${
          isFromOtherUser ? "bg-accent" : "bg-primary text-primary-foreground"
        }`}
      >
        <div className="text-sm">{content}</div>
        {showTime && (
          <div className="text-[10px] opacity-70 mt-1">
            {new Date(created_at).toLocaleTimeString()}
            {is_edited && " (edited)"}
          </div>
        )}
      </div>
    </div>
  );
}
