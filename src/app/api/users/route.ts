import { supabase } from '@/lib/supabase';

// Get all users
export async function GET() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  return new Response(JSON.stringify(data), { status: 200 });
}

// Create a new user
export async function POST(request: Request) {
  const { email, name } = await request.json();
  const { data, error } = await supabase.from('users').insert([{ email, name }]);
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  return new Response(JSON.stringify(data), { status: 201 });
}

// Update a user
export async function PUT(request: Request) {
  const { id, email, name } = await request.json();
  const { data, error } = await supabase.from('users').update({ email, name }).eq('id', id);
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  return new Response(JSON.stringify(data), { status: 200 });
}

// Delete a user
export async function DELETE(request: Request) {
  const { id } = await request.json();
  const { data, error } = await supabase.from('users').delete().eq('id', id);
  if (error) return new Response(JSON.stringify({ error }), { status: 400 });
  return new Response(JSON.stringify(data), { status: 200 });
}
