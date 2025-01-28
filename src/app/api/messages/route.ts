import { supabase } from '@/lib/supabase';

// Get all messages
export async function GET() {
  const { data, error } = await supabase.from('messages').select('*');
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  return new Response(JSON.stringify(data), { status: 200 });
}

// Create a new message
export async function POST(request: Request) {
  const { chat_id, user_id, content } = await request.json();
  const { data, error } = await supabase.from('messages').insert([{ chat_id, user_id, content }]);
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  return new Response(JSON.stringify(data), { status: 201 });
}

// Update a message
export async function PUT(request: Request) {
  const { id, content } = await request.json();
  const { data, error } = await supabase.from('messages').update({ content }).eq('id', id);
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  return new Response(JSON.stringify(data), { status: 200 });
}

// Delete a message
export async function DELETE(request: Request) {
  const { id } = await request.json();
  const { data, error } = await supabase.from('messages').delete().eq('id', id);
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  return new Response(JSON.stringify(data), { status: 200 });
}
