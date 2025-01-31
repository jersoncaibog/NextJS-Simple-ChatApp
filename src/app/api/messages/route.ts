import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Get all messages
export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data, error } = await supabase.from('messages').select('*');
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json(data);
}

// Create a new message
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { chat_id, content } = await request.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([{ 
        chat_id, 
        profile_id: user.id, 
        content 
      }]);

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}

// Update a message
export async function PUT(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { id, content } = await request.json();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user owns the message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .select("profile_id")
      .eq("id", id)
      .single();

    if (messageError) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.profile_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to edit this message" },
        { status: 403 }
      );
    }

    // Update the message
    const { error } = await supabase
      .from("messages")
      .update({ content, is_edited: true })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// Delete a message
export async function DELETE(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { id } = await request.json();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user owns the message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .select("profile_id")
      .eq("id", id)
      .single();

    if (messageError) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.profile_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this message" },
        { status: 403 }
      );
    }

    // Delete the message
    const { error } = await supabase.from("messages").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
