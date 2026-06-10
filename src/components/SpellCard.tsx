"use client";

import type { Spell } from "@/types";
import { levelSchoolLine } from "@/lib/spellFormat";

interface SpellCardProps {
  spell: Spell;
  onClick: () => void;
}

export default function SpellCard({ spell, onClick }: SpellCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-left transition-colors active:bg-surface-2"
    >
      <p className="text-[15px] font-bold text-fg">{spell.name}</p>
      <p className="mt-0.5 text-xs text-accent">{levelSchoolLine(spell)}</p>
      {spell.source && (
        <p className="mt-0.5 text-[11px] text-fg-dim">{spell.source}</p>
      )}
    </button>
  );
}
