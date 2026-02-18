-- Migration: Update match_candidates RPC to support filtering by IDs
-- Purpose: Allow ranking only a specific subset of candidates

drop function if exists match_candidates;

create or replace function match_candidates (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_ids uuid[] default null
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
  and (filter_ids is null or candidates.id = any(filter_ids))
  order by candidates.embedding <=> query_embedding
  limit match_count;
end;
$$;
