"use client";

import { useState } from "react";
import { X, Minus, Plus, Heart, Shield } from "lucide-react";
import type { Character } from "@/types";
import BottomSheet from "@/components/ui/BottomSheet";
import { characterStatus } from "@/components/PartyCard";

export default function DMCharacterControl({
  character,
  onClose,
  onUpdate,
}: {
  character: Character | null;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Character>) => void;
}) {
  const [amount, setAmount] = useState(1);

  const apply = (delta: number) => {
    if (!character) return;
    const next = Math.max(
      0,
      Math.min(character.hp_max, character.hp_current + delta),
    );
    onUpdate(character.id, { hp_current: next });
  };

  return (
    <BottomSheet open={character !== null} onClose={onClose}>
      {character && (
        <div className="px-5 pb-8 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-fg">{character.name}</h2>
              <p className="text-xs text-fg-muted">
                {[character.race, character.class, `Рівень ${character.level}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрити"
              className="rounded-full p-1 text-fg-muted active:text-fg"
            >
              <X size={22} />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span
              className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
              style={{
                color: characterStatus(character).color,
                backgroundColor: `${characterStatus(character).color}22`,
              }}
            >
              {characterStatus(character).label}
            </span>
            <span className="inline-flex items-center gap-1 text-fg-muted">
              <Shield size={14} className="text-accent" />
              КЗ {character.ac}
            </span>
            {character.hp_temp ? (
              <span className="text-fg-muted">Тимч. +{character.hp_temp}</span>
            ) : null}
          </div>

          {/* HP */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Heart size={20} className="text-danger" />
            <span className="text-3xl font-bold tabular-nums text-fg">
              {character.hp_current}
            </span>
            <span className="text-xl text-fg-dim">/ {character.hp_max}</span>
          </div>

          {/* Amount stepper */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setAmount((a) => Math.max(1, a - 1))}
              className="rounded-md border border-border p-2 text-fg-muted"
              aria-label="Менше"
            >
              <Minus size={16} />
            </button>
            <span className="w-12 text-center text-2xl font-bold tabular-nums text-fg">
              {amount}
            </span>
            <button
              type="button"
              onClick={() => setAmount((a) => a + 1)}
              className="rounded-md border border-border p-2 text-fg-muted"
              aria-label="Більше"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Damage / heal */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => apply(-amount)}
              className="rounded-lg border border-danger py-3 text-sm font-semibold text-danger active:bg-[#bf4f4f22]"
            >
              − Шкода
            </button>
            <button
              type="button"
              onClick={() => apply(amount)}
              className="rounded-lg border border-success py-3 text-sm font-semibold text-success active:bg-[#4fbf8f22]"
            >
              + Лікування
            </button>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdate(character.id, { hp_current: 0 })}
              className="rounded-lg border border-border py-2 text-xs text-fg-muted active:bg-surface-2"
            >
              До нуля
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdate(character.id, { hp_current: character.hp_max })
              }
              className="rounded-lg border border-border py-2 text-xs text-fg-muted active:bg-surface-2"
            >
              Повне HP
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
