import { supabase } from '@/lib/supabase';

// Get all chats
export async function GET() {
  const { data, error } = await supabase.from('chats').select('*');
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  return new Response(JSON.stringify(data), { status: 200 });
}

// Create a new chat
export async function POST(request: Request) {
  const { title } = await request.json();
  const { data, error } = await supabase.from('chats').insert([{ title }]);
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  return new Response(JSON.stringify(data), { status: 201 });
}

// Update a chat
export async function PUT(request: Request) {
  const { id, title } = await request.json();
  const { data, error } = await supabase.from('chats').update({ title }).eq('id', id);
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  return new Response(JSON.stringify(data), { status: 200 });
}

// Delete a chat
export async function DELETE(request: Request) {
  const { id } = await request.json();
  const { data, error } = await supabase.from('chats').delete().eq('id', id);
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  return new Response(JSON.stringify(data), { status: 200 });
}