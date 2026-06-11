"use client";

import type { Character } from "@/types";
import {
  ABILITIES,
  SKILLS,
  abilityModifier,
  formatModifier,
  proficiencyBonus,
} from "@/lib/dnd";

function InfoBlock({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
        {title}
      </p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-fg">
        {text}
      </p>
    </div>
  );
}

/** Read-only character overview: abilities, saves, skills and bio text. */
export default function CharacterInfo({
  character,
  showNotes = true,
}: {
  character: Character;
  /** Include the private player notes block (DM-only). */
  showNotes?: boolean;
}) {
  const pb = proficiencyBonus(character.level);
  const prof = character.proficiencies ?? { saves: [], skills: [] };

  return (
    <div className="flex flex-col gap-5">
      {/* Abilities */}
      <div className="grid grid-cols-3 gap-2">
        {ABILITIES.map((a) => {
          const mod = abilityModifier(character[a.key]);
          return (
            <div
              key={a.key}
              className="flex flex-col items-center rounded-lg border border-border bg-surface py-2"
            >
              <span className="text-[10px] uppercase text-fg-muted">
                {a.short}
              </span>
              <span className="text-lg font-bold text-fg">
                {character[a.key]}
              </span>
              <span className="text-xs text-accent">{formatModifier(mod)}</span>
            </div>
          );
        })}
      </div>

      {/* Saves */}
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
          Рятівні кидки
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ABILITIES.map((a) => {
            const on = prof.saves.includes(a.key);
            const mod = abilityModifier(character[a.key]) + (on ? pb : 0);
            return (
              <span
                key={a.key}
                className={`rounded-md px-2 py-0.5 text-xs ${
                  on ? "bg-accent-dim text-accent" : "text-fg-muted"
                }`}
              >
                {a.short} {formatModifier(mod)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
          Навички
        </p>
        <div className="overflow-hidden rounded-lg border border-border">
          {SKILLS.map((s, i) => {
            const on = prof.skills.includes(s.key);
            const mod = abilityModifier(character[s.ability]) + (on ? pb : 0);
            return (
              <div
                key={s.key}
                className={`flex items-center justify-between px-3 py-1.5 text-sm ${
                  i > 0 ? "border-t border-border" : ""
                } ${on ? "text-accent" : "text-fg-muted"}`}
              >
                <span>{s.label}</span>
                <span className="tabular-nums">{formatModifier(mod)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <InfoBlock title="Передісторія" text={character.backstory} />
      <InfoBlock title="Риси характеру" text={character.personality_traits} />
      <InfoBlock title="Мови та вміння" text={character.languages} />
      {showNotes && <InfoBlock title="Нотатки" text={character.notes} />}
    </div>
  );
}
