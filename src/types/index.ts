// Domain types for the Aelthar Compendium.
// These mirror the Supabase tables described in CLAUDE.md.

export type Role = "dm" | "player";

export interface Campaign {
  id: string;
  name: string;
  dm_id: string;
  invite_code: string;
  setting: string | null;
  description: string | null;
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

// Mirrors the Supabase `characters` table (columns confirmed against the live DB).
export interface Character {
  id: string;
  user_id: string;
  campaign_id: string | null;
  name: string;
  race: string;
  class: string;
  subclass: string | null;
  level: number;
  hp_current: number;
  hp_max: number;
  ac: number;
  background: string | null;
  alignment: string | null;
  speed: number | null;
  initiative: number | null;
  proficiency_bonus: number | null;
  created_at: string;
}

// A character row with its campaign name embedded (PostgREST join).
export interface CharacterWithCampaign extends Character {
  campaigns: { name: string } | null;
}

export type ItemCategory =
  | "weapon"
  | "armor"
  | "consumable"
  | "treasure"
  | "tool"
  | "misc";

export interface InventoryItem {
  id: string;
  character_id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
}

export interface CharacterSpell {
  id: string;
  character_id: string;
  spell_id: string;
  prepared: boolean;
}

export interface Session {
  id: string;
  campaign_id: string;
  title: string;
  date: string; // ISO date
  summary: string | null;
  dm_notes: string | null;
}

export interface Npc {
  id: string;
  campaign_id: string;
  name: string;
  role: string | null;
  public_info: string | null;
  secret_notes: string | null; // DM-only
}

// Compendium reference data.

// Mirrors the existing Supabase `spells` table.
export interface Spell {
  id: string;
  name: string;
  level: number; // 0 = cantrip
  school: string;
  casting_time: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  higher_levels: string | null;
  source: string;
  classes: string[] | string | null;
}

// Church-relation badge value for an Aelthar race.
export type ChurchRelation = "Вороже" | "Нейтрально" | "Більшість";

// Proposed schema for a `races` table (does not exist in Supabase yet).
export interface Race {
  id: string;
  name: string;
  region: string | null;
  church_relation: ChurchRelation | null;
  description: string | null;
}
