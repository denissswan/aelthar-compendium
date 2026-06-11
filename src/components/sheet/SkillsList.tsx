"use client";

import type { Character } from "@/types";
import {
  ABILITIES,
  SKILLS,
  abilityModifier,
  formatModifier,
  proficiencyBonus,
} from "@/lib/dnd";

const SHORT = Object.fromEntries(ABILITIES.map((a) => [a.key, a.short]));

export default function SkillsList({
  character,
  onToggle,
}: {
  character: Character;
  onToggle: (skillKey: string) => void;
}) {
  const pb = proficiencyBonus(character.level);
  const skills = character.proficiencies?.skills ?? [];

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {SKILLS.map((s, i) => {
        const proficient = skills.includes(s.key);
        const mod =
          abilityModifier(character[s.ability]) + (proficient ? pb : 0);
        return (
          <label
            key={s.key}
            className={`flex items-center gap-3 px-3 py-2.5 ${
              i > 0 ? "border-t border-border" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={proficient}
              onChange={() => onToggle(s.key)}
              className="h-4 w-4 accent-accent"
            />
            <span className="flex-1 text-sm text-fg">{s.label}</span>
            <span className="text-[10px] uppercase text-fg-dim">
              {SHORT[s.ability]}
            </span>
            <span className="w-8 text-right tabular-nums text-sm font-semibold text-accent">
              {formatModifier(mod)}
            </span>
          </label>
        );
      })}
    </div>
  );
}
