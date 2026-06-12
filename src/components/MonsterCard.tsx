"use client";

import type { Monster } from "@/types";

interface MonsterCardProps {
  monster: Monster;
  onClick: () => void;
}

/** One-line summary: size + type + alignment, with a CR badge. */
function subtitle(m: Monster): string {
  const parts = [m.size, m.type].filter(Boolean);
  let line = parts.join(" ");
  if (m.alignment) line += line ? `, ${m.alignment}` : m.alignment;
  return line;
}

export default function MonsterCard({ monster, onClick }: MonsterCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-left transition-colors active:bg-surface-2"
    >
      <div className="min-w-0">
        <p className="text-[15px] font-bold text-fg">{monster.name}</p>
        <p className="mt-0.5 truncate text-xs text-fg-muted">
          {subtitle(monster)}
        </p>
      </div>
      {monster.challenge_rating && (
        <span className="shrink-0 rounded-md bg-accent-dim px-2 py-0.5 text-xs font-semibold text-accent">
          CR {monster.challenge_rating}
        </span>
      )}
    </button>
  );
}
