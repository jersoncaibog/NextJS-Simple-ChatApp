"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type SearchResult = {
  id: string;
  email: string;
  full_name: string;
};

interface AddChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated: () => void;
}

export function AddChatDialog({
  open,
  onOpenChange,
  onChatCreated,
}: AddChatDialogProps) {
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    if (!open) {
      setSearchEmail("");
      setSearchResult(null);
      setError("");
    }
  }, [open]);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;

    setIsSearching(true);
    setError("");
    setSearchResult(null);

    try {
      const response = await fetch(
        `/api/users/search?email=${encodeURIComponent(searchEmail)}`
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Non-JSON response:", await response.text());
        throw new Error("Server returned an invalid response");
      }

      const data = await response.json();

      if (!response.ok) {
        console.error("Search error response:", data);
        throw new Error(data.error || "Failed to search for user");
      }

      setSearchResult(data.user);
    } catch (error) {
      console.error("Error searching user:", error);
      setError(
        error instanceof Error ? error.message : "Failed to search user"
      );
    } finally {
      setIsSearching(false);
    }
  };

  const startChat = async () => {
    if (!searchResult) return;

    try {
      const { data: currentUser } = await supabase.auth.getUser();

      // Check if chat already exists between these users
      const { data: existingChat } = await supabase
        .from("chat_participants")
        .select("chat_id")
        .eq("profile_id", currentUser.user?.id)
        .in(
          "chat_id",
          (
            await supabase
              .from("chat_participants")
              .select("chat_id")
              .eq("profile_id", searchResult.id)
          ).data?.map((chat) => chat.chat_id) || []
        );

      if (existingChat && existingChat.length > 0) {
        setError("A conversation with this user already exists");
        return;
      }

      const { data: chat, error: chatError } = await supabase
        .from("chats")
        .insert([{ created_by: currentUser.user?.id }])
        .select()
        .single();

      if (chatError) throw chatError;

      const { error: participantsError } = await supabase
        .from("chat_participants")
        .insert([
          {
            chat_id: chat.id,
            profile_id: currentUser.user?.id,
          },
          { chat_id: chat.id, profile_id: searchResult.id },
        ]);

      if (participantsError) throw participantsError;

      onChatCreated();
      setSearchEmail("");
      setSearchResult(null);
    } catch (error) {
      console.error("Error creating chat:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create chat"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Start New Chat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Search by Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchEmail.trim()}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {searchResult && (
            <div className="rounded-lg border p-4 space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">{searchResult.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {searchResult.email}
                </p>
              </div>
              <button
                onClick={startChat}
                className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Start Chat
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
