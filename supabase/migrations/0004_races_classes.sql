-- Compendium: races + classes reference tables (seeded from Open5e).
--
-- Run in the Supabase SQL editor BEFORE seeding races/classes.

-- 1. Races. Aelthar lore fields (region, church_relation) are nullable so the
--    Open5e import can fill name + description and you can flavour the rest.
create table if not exists public.races (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  region text,
  church_relation text,
  description text,
  source text default 'SRD',
  created_at timestamptz default now()
);

alter table public.races enable row level security;
drop policy if exists "races: everyone can read" on public.races;
create policy "races: everyone can read"
  on public.races for select to authenticated
  using (true);

create unique index if not exists races_name_key on public.races (name);

-- 2. Classes.
create table if not exists public.classes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  hit_die text,
  description text,
  proficiencies text,
  saving_throws text,
  spellcasting_ability text,
  source text default 'SRD',
  created_at timestamptz default now()
);

alter table public.classes enable row level security;
drop policy if exists "classes: everyone can read" on public.classes;
create policy "classes: everyone can read"
  on public.classes for select to authenticated
  using (true);

create unique index if not exists classes_name_key on public.classes (name);
