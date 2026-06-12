"use client";

import type { Character } from "@/types";
import { ABILITIES, abilityModifier, formatModifier } from "@/lib/dnd";
import NumberField from "@/components/sheet/NumberField";

export default function AbilityGrid({
  character,
  onChange,
}: {
  character: Character;
  onChange: (patch: Partial<Character>) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
      {ABILITIES.map((a) => {
        const score = character[a.key];
        const mod = abilityModifier(score);
        return (
          <div
            key={a.key}
            className="flex flex-col items-center rounded-lg border border-border bg-surface py-3"
          >
            <span className="text-[11px] uppercase tracking-[0.05em] text-fg-muted">
              {a.label}
            </span>
            <NumberField
              value={score}
              onChange={(v) => onChange({ [a.key]: v } as Partial<Character>)}
              ariaLabel={a.label}
              className="w-14 text-2xl font-bold text-fg"
            />
            <span className="mt-0.5 rounded-md bg-accent-dim px-2 text-sm font-semibold text-accent">
              {formatModifier(mod)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
