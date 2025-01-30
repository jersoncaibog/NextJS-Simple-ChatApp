-- Create a table for user profiles
create table profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    avatar_url text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Create a table for chats
create table chats (
    id uuid default gen_random_uuid() primary key,
    created_by uuid references profiles(id) on delete cascade not null,
    title text,
    is_group boolean default false,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Create a table for chat participants
create table chat_participants (
    id uuid default gen_random_uuid() primary key,
    chat_id uuid references chats(id) on delete cascade not null,
    profile_id uuid references profiles(id) on delete cascade not null,
    last_read_at timestamp with time zone default timezone('utc'::text, now()),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(chat_id, profile_id)
);
-- Create a table for messages
create table messages (
    id uuid default gen_random_uuid() primary key,
    chat_id uuid references chats(id) on delete cascade not null,
    profile_id uuid references profiles(id) on delete cascade not null,
    content text not null,
    is_edited boolean default false,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Enable Row Level Security
alter table profiles enable row level security;
alter table chats enable row level security;
alter table chat_participants enable row level security;
alter table messages enable row level security;
-- Create policies for profiles
create policy "Users can view their own profile" on profiles for
select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for
update using (auth.uid() = id);
-- Create policies for chats
create policy "Participants can view chats" on chats for
select using (
        exists (
            select 1
            from chat_participants
            where chat_id = chats.id
                and profile_id = auth.uid()
        )
    );
create policy "Users can create chats" on chats for
insert with check (created_by = auth.uid());
-- Create policies for chat participants
create policy "Participants can view chat members" on chat_participants for
select using (
        exists (
            select 1
            from chat_participants
            where chat_id = chat_participants.chat_id
                and profile_id = auth.uid()
        )
    );
create policy "Chat creators can add participants" on chat_participants for
insert with check (
        exists (
            select 1
            from chats
            where id = chat_participants.chat_id
                and created_by = auth.uid()
        )
    );
-- Create policies for messages
create policy "Participants can view messages" on messages for
select using (
        exists (
            select 1
            from chat_participants
            where chat_id = messages.chat_id
                and profile_id = auth.uid()
        )
    );
create policy "Participants can insert messages" on messages for
insert with check (
        exists (
            select 1
            from chat_participants
            where chat_id = messages.chat_id
                and profile_id = auth.uid()
        )
    );
create policy "Users can update their own messages" on messages for
update using (profile_id = auth.uid());
-- Create function to handle new user signup
create or replace function public.handle_new_user() returns trigger as $$ begin
insert into public.profiles (id, full_name, avatar_url)
values (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
return new;
end;
$$ language plpgsql security definer;
-- Create trigger for new user signup
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user();
-- Create indexes for better performance
create index chat_participants_chat_id_idx on chat_participants(chat_id);
create index chat_participants_profile_id_idx on chat_participants(profile_id);
create index messages_chat_id_idx on messages(chat_id);
create index messages_profile_id_idx on messages(profile_id);
create index messages_created_at_idx on messages(created_at desc);