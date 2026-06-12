"use client";

import { X } from "lucide-react";
import type { Monster, MonsterAbility } from "@/types";
import { abilityModifier, formatModifier } from "@/lib/dnd";
import BottomSheet from "@/components/ui/BottomSheet";

interface Props {
  monster: Monster | null;
  onClose: () => void;
}

function Stat({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === "") return null;
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-[11px] uppercase tracking-[0.05em] text-fg-muted">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-fg">{value}</p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <p className="text-sm text-fg-muted">
      <span className="font-semibold text-fg">{label}: </span>
      {value}
    </p>
  );
}

const ABILITY_ORDER: { key: keyof Monster; label: string }[] = [
  { key: "str", label: "СИЛ" },
  { key: "dex", label: "СПР" },
  { key: "con", label: "ВИТ" },
  { key: "int", label: "ІНТ" },
  { key: "wis", label: "МДР" },
  { key: "cha", label: "ХАР" },
];

function AbilityBlock({ title, items }: { title: string; items: MonsterAbility[] | null }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-accent">
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {items.map((a, i) => (
          <p key={`${a.name}-${i}`} className="text-sm leading-relaxed text-fg-muted">
            <span className="font-semibold text-fg">{a.name}. </span>
            {a.desc}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function MonsterDetailSheet({ monster, onClose }: Props) {
  return (
    <BottomSheet open={monster !== null} onClose={onClose}>
      {monster && (
        <div className="px-5 pb-8 pt-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl font-bold text-fg">{monster.name}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрити"
              className="-mr-1 rounded-full p-1 text-fg-muted active:text-fg"
            >
              <X size={22} />
            </button>
          </div>
          <p className="mt-0.5 text-sm italic text-fg-muted">
            {[monster.size, monster.type].filter(Boolean).join(" ")}
            {monster.alignment ? `, ${monster.alignment}` : ""}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {monster.challenge_rating && (
              <span className="rounded-md bg-accent-dim px-2 py-0.5 text-xs font-semibold text-accent">
                CR {monster.challenge_rating}
                {monster.xp != null ? ` · ${monster.xp} XP` : ""}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="КЗ" value={monster.armor_class} />
            <Stat
              label="Здоровʼя"
              value={
                monster.hit_points != null
                  ? `${monster.hit_points}${monster.hit_dice ? ` (${monster.hit_dice})` : ""}`
                  : null
              }
            />
            <Stat label="Швидкість" value={monster.speed} />
          </div>

          {/* Ability scores */}
          <div className="mt-3 grid grid-cols-6 gap-1.5">
            {ABILITY_ORDER.map(({ key, label }) => {
              const score = monster[key] as number | null;
              return (
                <div
                  key={key as string}
                  className="rounded-lg border border-border bg-surface py-2 text-center"
                >
                  <p className="text-[10px] uppercase text-fg-muted">{label}</p>
                  <p className="text-sm font-bold text-fg">{score ?? "—"}</p>
                  {score != null && (
                    <p className="text-[11px] text-accent">
                      {formatModifier(abilityModifier(score))}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-1.5">
            <Line label="Рятівні кидки" value={monster.saving_throws} />
            <Line label="Навички" value={monster.skills} />
            <Line label="Опір шкоді" value={monster.damage_resistances} />
            <Line label="Імунітет до шкоди" value={monster.damage_immunities} />
            <Line label="Імунітет до станів" value={monster.condition_immunities} />
            <Line label="Чуття" value={monster.senses} />
            <Line label="Мови" value={monster.languages} />
          </div>

          <AbilityBlock title="Особливості" items={monster.special_abilities} />
          <AbilityBlock title="Дії" items={monster.actions} />
          <AbilityBlock title="Легендарні дії" items={monster.legendary_actions} />

          {monster.source && (
            <p className="mt-5 text-[11px] text-fg-dim">{monster.source}</p>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
