"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching user data:", error);
        router.push("/login");
        return;
      }

      if (!session?.user) {
        console.log("No user logged in");
        router.push("/login");
        return;
      }

      console.log("Logged in user data:", {
        id: session.user.id,
        email: session.user.email,
        metadata: session.user.user_metadata,
        raw: session.user,
      });

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error checking profile:", profileError);
        router.push("/login");
        return;
      }

      // If profile doesn't exist, create it
      if (!profile) {
        const { error: insertError } = await supabase.from("profiles").upsert(
          [
            {
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || null,
              avatar_url: session.user.user_metadata?.avatar_url || null,
            },
          ],
          {
            onConflict: "id",
            ignoreDuplicates: false,
          }
        );

        if (insertError) {
          console.error("Error creating profile:", insertError);
          router.push("/login");
          return;
        }
        console.log("Created new profile for user");
      }

      // Redirect to chat page
      router.push("/chat");
    };

    fetchUserData();
  }, [router]);

  // TODO:
  // - error: duplicate adding chat
  // - error: email isnt getting added to new profiles

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Loading...</h2>
        <p className="text-sm text-muted-foreground">Setting up your chat</p>
      </div>
    </div>
  );
}
