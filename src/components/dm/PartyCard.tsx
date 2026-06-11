"use client";

import { Shield } from "lucide-react";
import type { Character } from "@/types";

function hpColor(pct: number): string {
  if (pct > 0.5) return "#4fbf8f";
  if (pct > 0.25) return "#d9b34f";
  return "#bf4f4f";
}

export function characterStatus(c: Character): {
  label: string;
  color: string;
} {
  if (c.hp_current <= 0) return { label: "Непритомний", color: "#bf4f4f" };
  return { label: "Живий", color: "#4fbf8f" };
}

export default function PartyCard({
  character,
  onClick,
}: {
  character: Character;
  onClick: () => void;
}) {
  const max = character.hp_max || 1;
  const pct = Math.max(0, Math.min(1, character.hp_current / max));
  const status = characterStatus(character);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-border bg-surface p-4 text-left active:bg-surface-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold text-fg">
            {character.name}
          </p>
          <p className="text-xs text-fg-muted">
            {[character.race, character.class, `Рівень ${character.level}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <span
          className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold"
          style={{ color: status.color, backgroundColor: `${status.color}22` }}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct * 100}%`, backgroundColor: hpColor(pct) }}
          />
        </div>
        <span className="text-xs tabular-nums text-fg-muted">
          {character.hp_current}/{character.hp_max}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
          <Shield size={12} className="text-accent" />
          {character.ac}
        </span>
      </div>

      {character.conditions?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {character.conditions.map((c) => (
            <span
              key={c}
              className="rounded-full bg-accent-dim px-2 py-0.5 text-[10px] text-accent"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
