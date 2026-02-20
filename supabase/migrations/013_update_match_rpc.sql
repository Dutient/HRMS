-- Migration: Update match_candidates RPC to support advanced filtering
-- Purpose: Allow filtering by experience range, location (fuzzy), and relocation willingness

drop function if exists match_candidates;

create or replace function match_candidates (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_ids uuid[] default null,
  min_exp int default null,
  max_exp int default null,
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
  experience int,
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
  -- ID Filter
  and (filter_ids is null or candidates.id = any(filter_ids))
  -- Experience Range Filter
  and (min_exp is null or candidates.experience >= min_exp)
  and (max_exp is null or candidates.experience <= max_exp)
  -- Location Filter (Fuzzy Match: ILIKE %...%)
  -- Matches if candidate is in the location OR is willing to relocate (if implied, but strictly checks textual match here)
  and (
    pref_location is null 
    or candidates.location ilike '%' || pref_location || '%'
  )
  -- Relocation Filter
  and (
    relocation_only is false 
    or candidates.will_relocate is true
  )
  order by candidates.embedding <=> query_embedding
  limit match_count;
end;
$$;
