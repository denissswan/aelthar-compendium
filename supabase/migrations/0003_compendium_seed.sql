-- Compendium seed support: monsters table + unique(name) for upsert-by-name.
--
-- Run in the Supabase SQL editor BEFORE `npm run seed`.

-- 1. Monsters reference table.
create table if not exists public.monsters (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  size text,
  type text,
  subtype text,
  alignment text,
  armor_class integer,
  hit_points integer,
  hit_dice text,
  speed text,
  str integer, dex integer, con integer,
  int integer, wis integer, cha integer,
  saving_throws text,
  skills text,
  damage_resistances text,
  damage_immunities text,
  condition_immunities text,
  senses text,
  languages text,
  challenge_rating text,
  xp integer,
  special_abilities jsonb,
  actions jsonb,
  legendary_actions jsonb,
  source text default 'SRD',
  created_at timestamptz default now()
);

alter table public.monsters enable row level security;

-- Read-only for any signed-in user (reference data).
drop policy if exists "monsters: everyone can read" on public.monsters;
create policy "monsters: everyone can read"
  on public.monsters for select to authenticated
  using (true);

-- 2. Unique names so the seed scripts can upsert by name.
create unique index if not exists monsters_name_key on public.monsters (name);
create unique index if not exists spells_name_key on public.spells (name);
