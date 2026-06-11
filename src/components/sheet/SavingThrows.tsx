"use client";

import type { AbilityKey } from "@/lib/dnd";
import type { Character } from "@/types";
import {
  ABILITIES,
  abilityModifier,
  formatModifier,
  proficiencyBonus,
} from "@/lib/dnd";

export default function SavingThrows({
  character,
  onToggle,
}: {
  character: Character;
  onToggle: (ability: AbilityKey) => void;
}) {
  const pb = proficiencyBonus(character.level);
  const saves = character.proficiencies?.saves ?? [];

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {ABILITIES.map((a, i) => {
        const proficient = saves.includes(a.key);
        const mod = abilityModifier(character[a.key]) + (proficient ? pb : 0);
        return (
          <label
            key={a.key}
            className={`flex items-center gap-3 px-3 py-2.5 ${
              i > 0 ? "border-t border-border" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={proficient}
              onChange={() => onToggle(a.key)}
              className="h-4 w-4 accent-accent"
            />
            <span className="flex-1 text-sm text-fg">{a.label}</span>
            <span className="tabular-nums text-sm font-semibold text-accent">
              {formatModifier(mod)}
            </span>
          </label>
        );
      })}
    </div>
  );
}
