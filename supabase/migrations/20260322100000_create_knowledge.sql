-- Enable pgvector extension for embedding columns (RAG)
create extension if not exists vector with schema extensions;

-- Make sure the vector type is accessible without schema prefix
set search_path to public, extensions;

-- ============================================================
-- PRODUCTS
-- ============================================================
create table public.products (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  price      numeric(10,2) not null,
  stock      integer not null default 0,
  embedding  vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Users can view own products"
  on public.products for select
  using (auth.uid() = user_id);

create policy "Users can insert own products"
  on public.products for insert
  with check (auth.uid() = user_id);

create policy "Users can update own products"
  on public.products for update
  using (auth.uid() = user_id);

create policy "Users can delete own products"
  on public.products for delete
  using (auth.uid() = user_id);

-- Index for future vector similarity search
create index products_embedding_idx on public.products
  using hnsw (embedding vector_cosine_ops);

-- ============================================================
-- FAQS
-- ============================================================
create table public.faqs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  question   text not null,
  answer     text not null,
  embedding  vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.faqs enable row level security;

create policy "Users can view own faqs"
  on public.faqs for select
  using (auth.uid() = user_id);

create policy "Users can insert own faqs"
  on public.faqs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own faqs"
  on public.faqs for update
  using (auth.uid() = user_id);

create policy "Users can delete own faqs"
  on public.faqs for delete
  using (auth.uid() = user_id);

create index faqs_embedding_idx on public.faqs
  using hnsw (embedding vector_cosine_ops);
