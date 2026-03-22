-- ============================================================
-- PERSONA SETTINGS
-- ============================================================
create table public.persona_settings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references auth.users(id) on delete cascade,
  bot_name        text not null default 'ShopBot Assistant',
  tone            text not null default 'friendly',
  system_prompt   text not null default '',
  welcome_message text not null default '',
  updated_at      timestamptz not null default now()
);

alter table public.persona_settings enable row level security;

create policy "Users can view own persona"
  on public.persona_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own persona"
  on public.persona_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own persona"
  on public.persona_settings for update
  using (auth.uid() = user_id);

create policy "Users can delete own persona"
  on public.persona_settings for delete
  using (auth.uid() = user_id);
