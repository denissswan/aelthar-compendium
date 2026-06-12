-- Session Log: publish/draft support.
--
-- Run this in the Supabase SQL editor BEFORE using the "Сесії" tab — the
-- frontend reads/writes `sessions.is_published` and players read published
-- sessions through the `sessions_public` view.

-- 1. Publish flag on sessions (existing rows default to draft / hidden).
alter table public.sessions
  add column if not exists is_published boolean not null default false;

-- 2. Player-facing view: published sessions only, dm_notes omitted.
--    Recreated from scratch so the new is_published column is included
--    regardless of the previous column order. The view runs with its
--    owner's privileges, so players can read it past the sessions RLS.
drop view if exists public.sessions_public;

create view public.sessions_public as
select
  id,
  campaign_id,
  session_number,
  title,
  date,
  summary,
  is_published,
  created_at
from public.sessions
where is_published = true;

grant select on public.sessions_public to anon, authenticated;
