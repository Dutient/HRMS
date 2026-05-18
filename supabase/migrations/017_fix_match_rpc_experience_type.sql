-- Migration: Fix match_candidates RPC return type for experience column
-- Reason: experience column was changed from INTEGER to DECIMAL(5,1) in migration 016
-- but the RPC function still declared experience as int, causing type mismatch error (code 42804).

drop function if exists match_candidates;

create or replace function match_candidates (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_ids uuid[] default null,
  min_exp numeric default null,
  max_exp numeric default null,
  pref_location text default null,
  relocation_only boolean default false
)
returns table (
  id uuid,
  name text,
  email text,
  role text,
  skills text[],
  resume_text text,
  location text,
  will_relocate boolean,
  experience numeric(5,1),
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
    candidates.location,
    candidates.will_relocate,
    candidates.experience,
    1 - (candidates.embedding <=> query_embedding) as similarity
  from candidates
  where 1 - (candidates.embedding <=> query_embedding) > match_threshold
  and (filter_ids is null or candidates.id = any(filter_ids))
  and (min_exp is null or candidates.experience >= min_exp)
  and (max_exp is null or candidates.experience <= max_exp)
  and (
    pref_location is null
    or candidates.location ilike '%' || pref_location || '%'
  )
  and (
    relocation_only is false
    or candidates.will_relocate is true
  )
  order by candidates.embedding <=> query_embedding
  limit match_count;
end;
$$;
