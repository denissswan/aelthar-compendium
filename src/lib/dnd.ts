// D&D 5e helpers and constants for the character sheet.

export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export interface AbilityDef {
  key: AbilityKey;
  short: string; // STR
  label: string; // Сила
}

export const ABILITIES: AbilityDef[] = [
  { key: "str", short: "STR", label: "Сила" },
  { key: "dex", short: "DEX", label: "Спритність" },
  { key: "con", short: "CON", label: "Статура" },
  { key: "int", short: "INT", label: "Інтелект" },
  { key: "wis", short: "WIS", label: "Мудрість" },
  { key: "cha", short: "CHA", label: "Харизма" },
];

export interface SkillDef {
  key: string; // slug stored in proficiencies.skills
  label: string; // Ukrainian name
  ability: AbilityKey;
}

// Alphabetical (by English name, per spec).
export const SKILLS: SkillDef[] = [
  { key: "acrobatics", label: "Акробатика", ability: "dex" },
  { key: "animal_handling", label: "Догляд за тваринами", ability: "wis" },
  { key: "arcana", label: "Тайнознавство", ability: "int" },
  { key: "athletics", label: "Атлетика", ability: "str" },
  { key: "deception", label: "Обман", ability: "cha" },
  { key: "history", label: "Історія", ability: "int" },
  { key: "insight", label: "Проникливість", ability: "wis" },
  { key: "intimidation", label: "Залякування", ability: "cha" },
  { key: "investigation", label: "Розслідування", ability: "int" },
  { key: "medicine", label: "Медицина", ability: "wis" },
  { key: "nature", label: "Природа", ability: "int" },
  { key: "perception", label: "Сприйняття", ability: "wis" },
  { key: "performance", label: "Виступ", ability: "cha" },
  { key: "persuasion", label: "Переконання", ability: "cha" },
  { key: "religion", label: "Релігія", ability: "int" },
  { key: "sleight_of_hand", label: "Спритність рук", ability: "dex" },
  { key: "stealth", label: "Скритність", ability: "dex" },
  { key: "survival", label: "Виживання", ability: "wis" },
];

/** Ability modifier: floor((score - 10) / 2). */
export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** Signed modifier string, e.g. +3 / -1 / +0. */
export function formatModifier(mod: number): string {
  return (mod >= 0 ? "+" : "") + mod;
}

/** Proficiency bonus = ceil(level / 4) + 1 (per spec). */
export function proficiencyBonus(level: number): number {
  return Math.ceil(Math.max(1, level) / 4) + 1;
}

/** Hit die size derived from class name (English or Ukrainian). Defaults to 8. */
export function hitDieForClass(className: string | null | undefined): number {
  const c = (className ?? "").toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => c.includes(k));
  if (has("barbarian", "варвар")) return 12;
  if (has("fighter", "воїн", "paladin", "паладин", "ranger", "слідопит"))
    return 10;
  if (has("sorcerer", "чародій", "wizard", "маг", "чарівник")) return 6;
  // Bard, Cleric, Druid, Monk, Rogue, Warlock and unknowns.
  return 8;
}
