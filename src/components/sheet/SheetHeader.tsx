"use client";

import type { Character } from "@/types";
import { abilityModifier, formatModifier } from "@/lib/dnd";

function hpColor(pct: number): string {
  if (pct > 0.5) return "#4fbf8f";
  if (pct > 0.25) return "#d9b34f";
  return "#bf4f4f";
}

function QuickStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex-1 rounded-lg border border-border bg-surface py-2 text-center">
      <p className="text-[10px] uppercase tracking-[0.06em] text-fg-muted">
        {label}
      </p>
      <p className="text-lg font-bold text-fg">{value}</p>
    </div>
  );
}

export default function SheetHeader({ character }: { character: Character }) {
  const max = character.hp_max || 1;
  const pct = Math.max(0, Math.min(1, character.hp_current / max));
  const initiative =
    character.initiative ?? abilityModifier(character.dex);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-2xl font-bold text-accent">{character.name}</h1>
        <p className="text-sm text-fg-muted">
          {[character.race, character.class, `Рівень ${character.level}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      {/* HP bar */}
      <div>
        <div className="mb-1 flex items-baseline justify-between text-xs">
          <span className="text-fg-muted">Здоровʼя</span>
          <span className="font-semibold text-fg">
            {character.hp_current}/{character.hp_max}
            {character.hp_temp ? ` (+${character.hp_temp})` : ""}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${pct * 100}%`, backgroundColor: hpColor(pct) }}
          />
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex gap-2">
        <QuickStat label="КЗ" value={character.ac} />
        <QuickStat label="Швидк." value={character.speed ?? 0} />
        <QuickStat label="Ініц." value={formatModifier(initiative)} />
      </div>
    </div>
  );
}
