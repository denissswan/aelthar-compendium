"use client";

import { X } from "lucide-react";
import type { Spell } from "@/types";
import { levelLabel } from "@/lib/spellFormat";
import BottomSheet from "@/components/ui/BottomSheet";

interface SpellDetailSheetProps {
  spell: Spell | null;
  onClose: () => void;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-[11px] uppercase tracking-[0.05em] text-fg-muted">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-fg">{value || "—"}</p>
    </div>
  );
}

export default function SpellDetailSheet({
  spell,
  onClose,
}: SpellDetailSheetProps) {
  return (
    <BottomSheet open={spell !== null} onClose={onClose}>
      {spell && (
        <div className="px-5 pb-8 pt-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl font-bold text-fg">{spell.name}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрити"
              className="-mr-1 rounded-full p-1 text-fg-muted active:text-fg"
            >
              <X size={22} />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-md bg-accent-dim px-2 py-0.5 text-xs font-semibold text-accent">
              {levelLabel(spell.level)}
            </span>
            <span className="rounded-md border border-border px-2 py-0.5 text-xs text-fg-muted">
              {spell.school}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Stat label="Час створення" value={spell.casting_time} />
            <Stat label="Дистанція" value={spell.range} />
            <Stat label="Компоненти" value={spell.components} />
            <Stat label="Тривалість" value={spell.duration} />
          </div>

          <div className="mt-5">
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-fg">
              {spell.description}
            </p>
          </div>

          {spell.higher_levels && (
            <div className="mt-4 rounded-lg border border-border bg-surface p-3">
              <p className="text-[11px] uppercase tracking-[0.05em] text-accent">
                На вищих рівнях
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-fg">
                {spell.higher_levels}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-lg border border-border bg-surface py-3 text-sm font-semibold text-fg-muted active:bg-surface-2"
          >
            Закрити
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
