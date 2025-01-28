'use client'

import { ChatInterface } from "@/components/chat/ChatInterface";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching user data:", error);
      } else {
        console.log("Logged in user data:", session?.user);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen">
      <ChatInterface />
    </div>
  );
}
