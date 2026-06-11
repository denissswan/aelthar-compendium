"use client";

import { X, Heart, Shield } from "lucide-react";
import type { Character } from "@/types";
import BottomSheet from "@/components/ui/BottomSheet";
import CharacterInfo from "@/components/sheet/CharacterInfo";

export default function PlayerCharacterModal({
  character,
  onClose,
}: {
  character: Character | null;
  onClose: () => void;
}) {
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

          <div className="mt-3 flex items-center gap-3 text-sm text-fg-muted">
            <span className="inline-flex items-center gap-1">
              <Heart size={14} className="text-danger" />
              {character.hp_current}/{character.hp_max}
            </span>
            <span className="inline-flex items-center gap-1">
              <Shield size={14} className="text-accent" />
              КЗ {character.ac}
            </span>
          </div>

          <div className="mt-4">
            <CharacterInfo character={character} showNotes={false} />
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
