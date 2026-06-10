import type { Spell } from "@/types";

/** "Замовляння" for cantrips, otherwise "N рівень". */
export function levelLabel(level: number): string {
  return level === 0 ? "Замовляння" : `${level} рівень`;
}

/** Combined "level · school" line used on cards. */
export function levelSchoolLine(spell: Spell): string {
  return `${levelLabel(spell.level)} · ${spell.school}`;
}
