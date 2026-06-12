"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CharacterClass } from "@/types";

function Line({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <p className="text-sm text-fg-muted">
      <span className="font-semibold text-fg">{label}: </span>
      {value}
    </p>
  );
}

export default function ClassCard({ klass }: { klass: CharacterClass }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-fg">{klass.name}</p>
          {klass.hit_die && (
            <p className="mt-0.5 text-xs text-accent">
              Кубик здоровʼя: d{String(klass.hit_die).replace(/^d/i, "")}
            </p>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-fg-dim transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-2 border-t border-border px-4 py-3">
          <Line label="Володіння рятівними кидками" value={klass.saving_throws} />
          <Line label="Здатність до чарів" value={klass.spellcasting_ability} />
          <Line label="Володіння" value={klass.proficiencies} />
          {klass.description && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">
              {klass.description}
            </p>
          )}
          {klass.source && (
            <p className="text-[11px] text-fg-dim">{klass.source}</p>
          )}
        </div>
      )}
    </div>
  );
}
