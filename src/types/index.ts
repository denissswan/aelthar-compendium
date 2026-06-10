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

export interface Character {
  id: string;
  user_id: string;
  campaign_id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  hp_current: number;
  hp_max: number;
  armor_class: number;
  stats: AbilityScores;
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
