-- ============================================================
-- Vector similarity search functions for RAG
-- ============================================================

-- Make vector type accessible without schema prefix
set search_path to public, extensions;

create or replace function match_products(
  query_embedding vector(1536),
  match_count int default 5,
  filter_user_id uuid default null
)
returns table (
  id uuid,
  name text,
  price numeric,
  stock integer,
  similarity float
)
language plpgsql
as $$
begin
  return query
    select
      p.id,
      p.name,
      p.price,
      p.stock,
      1 - (p.embedding <=> query_embedding) as similarity
    from public.products p
    where p.embedding is not null
      and (filter_user_id is null or p.user_id = filter_user_id)
    order by p.embedding <=> query_embedding
    limit match_count;
end;
$$;

create or replace function match_faqs(
  query_embedding vector(1536),
  match_count int default 5,
  filter_user_id uuid default null
)
returns table (
  id uuid,
  question text,
  answer text,
  similarity float
)
language plpgsql
as $$
begin
  return query
    select
      f.id,
      f.question,
      f.answer,
      1 - (f.embedding <=> query_embedding) as similarity
    from public.faqs f
    where f.embedding is not null
      and (filter_user_id is null or f.user_id = filter_user_id)
    order by f.embedding <=> query_embedding
    limit match_count;
end;
$$;
