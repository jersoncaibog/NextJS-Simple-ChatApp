"use client";

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

interface ChatMessageProps {
  id: string;
  content: string;
  created_at: string;
  is_edited: boolean;
  isFromOtherUser: boolean;
  profile_id: string;
  status?: "sending" | "sent";
  onMessageDeleted?: () => void;
  onEdit?: () => void;
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
  const [showTime, setShowTime] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    async function checkCurrentUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsCurrentUser(user?.id === profile_id);
    }
    checkCurrentUser();
  }, [profile_id]);

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

      <div
        className={`flex ${
          isFromOtherUser ? "justify-start" : "justify-end text-right"
        }`}
      >
        <div
          className="flex flex-col relative group"
          onMouseEnter={() => setShowTime(true)}
          onMouseLeave={() => setShowTime(false)}
          onClick={() => setShowTime(!showTime)}
        >
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

          <div className="flex gap-2 items-center">
            {!isFromOtherUser && isCurrentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!showTime}>
                  <button
                    className={`p-1.5 rounded-full opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-accent active:bg-accent focus:bg-accent focus:opacity-100 ${
                      showTime ? "opacity-100" : "opacity-0"
                    }`}
                    aria-label="Message actions"
                  >
                    <BsThreeDots className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[100px]"
                >
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
