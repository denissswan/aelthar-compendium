"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import NumberField from "@/components/sheet/NumberField";

type Slots = Record<string, { total: number; used: number }>;

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function SpellSlots({ characterId }: { characterId: string }) {
  const [slots, setSlots] = useLocalStorage<Slots>(
    STORAGE_KEYS.spellSlots(characterId),
    {},
  );
  const [editing, setEditing] = useState(false);

  const setTotal = (lvl: number, total: number) =>
    setSlots((prev) => {
      const cur = prev[lvl] ?? { total: 0, used: 0 };
      return {
        ...prev,
        [lvl]: { total, used: Math.min(cur.used, total) },
      };
    });

  const setUsed = (lvl: number, used: number) =>
    setSlots((prev) => {
      const cur = prev[lvl] ?? { total: 0, used: 0 };
      return { ...prev, [lvl]: { ...cur, used: Math.max(0, Math.min(used, cur.total)) } };
    });

  const active = LEVELS.filter((l) => (slots[l]?.total ?? 0) > 0);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-fg">Слоти заклять</span>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="text-xs text-accent"
        >
          {editing ? "Готово" : "Налаштувати"}
        </button>
      </div>

      {editing ? (
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map((lvl) => (
            <label
              key={lvl}
              className="flex items-center justify-between gap-1 rounded-md border border-border px-2 py-1"
            >
              <span className="text-xs text-fg-muted">Р{lvl}</span>
              <NumberField
                value={slots[lvl]?.total ?? 0}
                onChange={(v) => setTotal(lvl, Math.max(0, v))}
                className="w-8 text-fg"
                ariaLabel={`Слоти рівня ${lvl}`}
              />
            </label>
          ))}
        </div>
      ) : active.length === 0 ? (
        <p className="text-[13px] text-fg-dim">
          Слотів немає. Натисніть «Налаштувати», щоб додати.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {active.map((lvl) => {
            const { total, used } = slots[lvl];
            return (
              <div key={lvl} className="flex items-center gap-3">
                <span className="w-14 text-sm text-fg-muted">Рівень {lvl}</span>
                <div className="flex flex-1 flex-wrap gap-1.5">
                  {Array.from({ length: total }).map((_, i) => {
                    const filled = i < used;
                    return (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Слот ${i + 1}`}
                        onClick={() => setUsed(lvl, i + 1 === used ? i : i + 1)}
                        className="h-5 w-5 rounded border-2"
                        style={{
                          borderColor: "#c8843a",
                          backgroundColor: filled ? "transparent" : "#c8843a",
                        }}
                      />
                    );
                  })}
                </div>
                <span className="text-xs tabular-nums text-fg-dim">
                  {total - used}/{total}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
