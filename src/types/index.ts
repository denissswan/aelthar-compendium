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

// Proficiency flags stored in the `proficiencies` jsonb column.
export interface Proficiencies {
  saves: string[]; // ability keys: str/dex/con/int/wis/cha
  skills: string[]; // skill slugs, e.g. "stealth"
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
  hp_temp: number | null;
  ac: number;
  speed: number | null;
  initiative: number | null;
  proficiency_bonus: number | null;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  proficiencies: Proficiencies | null;
  notes: string | null;
  background: string | null;
  alignment: string | null;
  appearance: string | null;
  backstory: string | null;
  personality_traits: string | null;
  ideals: string | null;
  bonds: string | null;
  flaws: string | null;
  languages: string | null;
  conditions: string[];
  gold: number;
  silver: number;
  copper: number;
  created_at: string;
}

export type QuestStatus = "active" | "completed" | "failed";

export interface Quest {
  id: string;
  campaign_id: string;
  title: string;
  description: string | null;
  giver: string | null;
  status: QuestStatus;
  created_at: string;
}

// A character_spells row with the full spell embedded (PostgREST join).
export interface CharacterSpellRow {
  id: string;
  character_id: string;
  spell_id: string;
  prepared: boolean;
  spells: Spell;
}

// A character row with its campaign name embedded (PostgREST join).
export interface CharacterWithCampaign extends Character {
  campaigns: { name: string } | null;
}

// Item categories (stored verbatim in the `category` column).
export const ITEM_CATEGORIES = [
  "Зброя",
  "Броня",
  "Інструмент",
  "Зілля",
  "Магічний",
  "Інше",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export interface InventoryItem {
  id: string;
  character_id: string;
  name: string;
  description: string | null;
  quantity: number;
  category: string;
  equipped: boolean;
  created_at: string;
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
  session_number: number;
  title: string;
  date: string; // ISO date
  summary: string | null;
  dm_notes: string | null; // DM-only
  created_at: string;
}

export interface Npc {
  id: string;
  campaign_id: string;
  name: string;
  role: string | null;
  faction: string | null;
  location: string | null;
  public_info: string | null;
  secret_notes: string | null; // DM-only
  is_visible_to_players: boolean;
  created_at: string;
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
