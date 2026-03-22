-- ============================================================
-- CONVERSATIONS
-- ============================================================
create table public.conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  phone       text not null,
  last_message_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

alter table public.conversations enable row level security;

create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Service role can insert conversations"
  on public.conversations for insert
  with check (true);

create policy "Service role can update conversations"
  on public.conversations for update
  using (true);

create index conversations_user_phone_idx
  on public.conversations (user_id, phone);

-- ============================================================
-- MESSAGES
-- ============================================================
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'bot')),
  body            text not null,
  created_at      timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Users can view own messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

create policy "Service role can insert messages"
  on public.messages for insert
  with check (true);

create index messages_conversation_idx
  on public.messages (conversation_id, created_at);
