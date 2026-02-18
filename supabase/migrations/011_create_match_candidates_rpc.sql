-- Migration: Create match_candidates RPC function
-- Purpose: Enable vector similarity search for candidates

create or replace function match_candidates (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  name text,
  email text,
  role text,
  skills text[],
  resume_text text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    candidates.id,
    candidates.name,
    candidates.email,
    candidates.role,
    candidates.skills,
    candidates.resume_text,
    1 - (candidates.embedding <=> query_embedding) as similarity
  from candidates
  where 1 - (candidates.embedding <=> query_embedding) > match_threshold
  order by candidates.embedding <=> query_embedding
  limit match_count;
end;
$$;
