-- ============================================
-- The Botanical Diary of Us — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Relationship Info (start date, partner names)
create table if not exists relationship_info (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  partner_name text,
  start_date date not null,
  created_at timestamptz default now(),
  unique(user_id)
);

-- 2. Diary Entries
create table if not exists diary_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  entry_date date not null,
  mood text check (mood in ('romantic','joyful','peaceful','special','emotional')),
  flower_type text check (flower_type in ('rose','sunflower','lily','orchid','jasmine')),
  title text,
  diary_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Media Attachments
create table if not exists media_attachments (
  id uuid default gen_random_uuid() primary key,
  entry_id uuid references diary_entries(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_url text not null,
  file_type text check (file_type in ('photo','video','audio','screenshot')),
  caption text,
  created_at timestamptz default now()
);

-- 4. Future Letters
create table if not exists future_letters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  message text not null,
  deliver_date date not null,
  is_opened boolean default false,
  created_at timestamptz default now()
);

-- 5. Enable Row Level Security
alter table relationship_info enable row level security;
alter table diary_entries enable row level security;
alter table media_attachments enable row level security;
alter table future_letters enable row level security;

-- 6. RLS Policies — users can only access their own data
create policy "Users read own relationship_info" on relationship_info for select using (auth.uid() = user_id);
create policy "Users insert own relationship_info" on relationship_info for insert with check (auth.uid() = user_id);
create policy "Users update own relationship_info" on relationship_info for update using (auth.uid() = user_id);

create policy "Users read own diary_entries" on diary_entries for select using (auth.uid() = user_id);
create policy "Users insert own diary_entries" on diary_entries for insert with check (auth.uid() = user_id);
create policy "Users update own diary_entries" on diary_entries for update using (auth.uid() = user_id);
create policy "Users delete own diary_entries" on diary_entries for delete using (auth.uid() = user_id);

create policy "Users read own media" on media_attachments for select using (auth.uid() = user_id);
create policy "Users insert own media" on media_attachments for insert with check (auth.uid() = user_id);
create policy "Users delete own media" on media_attachments for delete using (auth.uid() = user_id);

create policy "Users read own letters" on future_letters for select using (auth.uid() = user_id);
create policy "Users insert own letters" on future_letters for insert with check (auth.uid() = user_id);
create policy "Users update own letters" on future_letters for update using (auth.uid() = user_id);
create policy "Users delete own letters" on future_letters for delete using (auth.uid() = user_id);

-- 7. Storage bucket for media uploads
insert into storage.buckets (id, name, public) values ('diary-media', 'diary-media', true)
on conflict (id) do nothing;

create policy "Users upload media" on storage.objects for insert with check (bucket_id = 'diary-media' and auth.uid() is not null);
create policy "Public read media" on storage.objects for select using (bucket_id = 'diary-media');

-- 8. Chat Messages (private chat between two lovers)
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  sender_name text,
  content text,
  media_url text,
  media_type text check (media_type in ('photo','video','audio','file')),
  connection_id uuid,
  created_at timestamptz default now()
);

alter table messages enable row level security;

-- 9. Connections (pair two lovers)
create table if not exists connections (
  id uuid default gen_random_uuid() primary key,
  invite_code text unique not null,
  user_a uuid references auth.users(id) on delete cascade not null,
  user_b uuid references auth.users(id) on delete cascade,
  status text default 'pending' check (status in ('pending','connected')),
  created_at timestamptz default now()
);

alter table connections enable row level security;
create policy "Users read own connections" on connections for select using (auth.uid() = user_a or auth.uid() = user_b);
create policy "Users create connections" on connections for insert with check (auth.uid() = user_a);
create policy "Users update connections" on connections for update using (auth.uid() = user_a or auth.uid() = user_b);

-- Messages RLS: only connected users can read/send
create policy "Connected users read messages" on messages for select using (
  exists (
    select 1 from connections c
    where c.id = messages.connection_id
    and c.status = 'connected'
    and (c.user_a = auth.uid() or c.user_b = auth.uid())
  )
);
create policy "Connected users send messages" on messages for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from connections c
    where c.id = connection_id
    and c.status = 'connected'
    and (c.user_a = auth.uid() or c.user_b = auth.uid())
  )
);
create policy "Users delete own messages" on messages for delete using (auth.uid() = user_id);

-- Enable realtime for messages
alter publication supabase_realtime add table messages;
