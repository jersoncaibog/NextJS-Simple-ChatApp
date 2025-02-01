"use client";

/**
 * ChatMessage Component
 *
 * This component renders an individual chat message with the following features:
 * - Different styling for sent and received messages
 * - Click to toggle timestamp and actions
 * - Edit and delete capabilities for own messages
 * - Message status indicators (sending/sent)
 * - Confirmation dialog for message deletion
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";

// Props interface for the ChatMessage component
interface ChatMessageProps {
  id: string; // Unique identifier for the message
  content: string; // The message content
  created_at: string; // Timestamp when message was created
  is_edited: boolean; // Whether the message has been edited
  isFromOtherUser: boolean; // Whether the message is from another user
  profile_id: string; // ID of the user who sent the message
  status?: "sending" | "sent"; // Message delivery status
  onMessageDeleted?: () => void; // Callback when message is deleted
  onEdit?: () => void; // Callback when message is edited
}

export function ChatMessage({
  id,
  content,
  created_at,
  is_edited,
  isFromOtherUser,
  profile_id,
  status = "sent",
  onMessageDeleted,
  onEdit,
}: ChatMessageProps) {
  // State for UI interactions
  const [showTime, setShowTime] = useState(false); // Controls visibility of timestamp and actions
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // Controls delete confirmation dialog
  const [isCurrentUser, setIsCurrentUser] = useState(false); // Whether the message is from current user

  // Check if the message is from the current user on component mount
  useEffect(() => {
    async function checkCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsCurrentUser(user?.id === profile_id);
    }
    checkCurrentUser();
  }, [profile_id]);

  // Handle message deletion with database update
  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) throw error;
      onMessageDeleted?.();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="rounded-md px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Container - Handles left/right alignment */}
      <div
        className={`flex ${
          isFromOtherUser ? "justify-start" : "justify-end text-right"
        }`}
      >
        {/* Message Wrapper - Handles click interactions */}
        <div
          className="flex flex-col relative group touch-manipulation"
          onClick={() => setShowTime(!showTime)}
        >
          {/* Time and Status Section - Shows/hides on click */}
          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              showTime ? "max-h-8 opacity-100 mb-1 mt-2" : "max-h-0 opacity-0"
            }`}
          >
            <div className="text-[10px] opacity-70 flex items-center gap-1 justify-end">
              {status === "sent" && (
                <span>
                  {new Date(created_at).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              )}
              {is_edited && <span>(edited)</span>}
            </div>
          </div>

          {/* Message Content and Actions Area */}
          <div className="flex gap-2 items-center">
            {/* Message Actions Menu - Only for own messages */}
            {!isFromOtherUser && isCurrentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!showTime}>
                  <button
                    className={`p-1.5 rounded-full transition-opacity hover:bg-accent active:bg-accent focus:bg-accent ${
                      showTime ? "opacity-100" : "opacity-0"
                    }`}
                    aria-label="Message actions"
                  >
                    <BsThreeDots className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[100px]">
                  <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {/* Message Bubble */}
            <div
              className={`rounded-lg px-3 py-2 break-all ${
                isFromOtherUser
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {content}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
