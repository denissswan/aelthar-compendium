"use client";

import type { Character } from "@/types";
import { abilityModifier, hitDieForClass } from "@/lib/dnd";
import NumberField from "@/components/sheet/NumberField";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-border bg-surface py-2.5">
      <span className="text-[10px] uppercase tracking-[0.05em] text-fg-muted">
        {label}
      </span>
      <div className="text-lg font-bold text-fg">{children}</div>
    </div>
  );
}

export default function CombatStats({
  character,
  onChange,
}: {
  character: Character;
  onChange: (patch: Partial<Character>) => void;
}) {
  const hitDie = hitDieForClass(character.class);
  const initiative = character.initiative ?? abilityModifier(character.dex);

  return (
    <div className="flex flex-col gap-3">
      {/* HP */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex items-end justify-center gap-2">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-[0.05em] text-fg-muted">
              Поточні
            </span>
            <NumberField
              value={character.hp_current}
              onChange={(v) => onChange({ hp_current: v })}
              ariaLabel="Поточні HP"
              className="w-20 text-4xl font-bold text-fg"
            />
          </div>
          <span className="pb-3 text-2xl text-fg-dim">/</span>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-[0.05em] text-fg-muted">
              Макс.
            </span>
            <NumberField
              value={character.hp_max}
              onChange={(v) => onChange({ hp_max: v })}
              ariaLabel="Максимум HP"
              className="w-20 text-4xl font-bold text-fg-muted"
            />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 text-sm">
          <span className="text-[11px] uppercase tracking-[0.05em] text-fg-muted">
            Тимч. HP
          </span>
          <NumberField
            value={character.hp_temp ?? 0}
            onChange={(v) => onChange({ hp_temp: v })}
            ariaLabel="Тимчасові HP"
            className="w-12 rounded-md border border-border py-0.5 text-fg"
          />
        </div>
      </div>

      {/* Other combat stats */}
      <div className="grid grid-cols-4 gap-2">
        <Field label="КЗ">
          <NumberField
            value={character.ac}
            onChange={(v) => onChange({ ac: v })}
            ariaLabel="Клас захисту"
            className="w-12"
          />
        </Field>
        <Field label="Швидк.">
          <NumberField
            value={character.speed ?? 0}
            onChange={(v) => onChange({ speed: v })}
            ariaLabel="Швидкість"
            className="w-12"
          />
        </Field>
        <Field label="Ініц.">
          <NumberField
            value={initiative}
            onChange={(v) => onChange({ initiative: v })}
            ariaLabel="Ініціатива"
            className="w-12"
          />
        </Field>
        <Field label="Кубик">
          <span className="text-base">
            {character.level}d{hitDie}
          </span>
        </Field>
      </div>
    </div>
  );
}
