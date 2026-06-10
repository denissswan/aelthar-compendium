"use client";

import { MoreHorizontal, UserRound, Heart, Shield } from "lucide-react";
import type { CharacterWithCampaign } from "@/types";

function Badge({
  icon: Icon,
  children,
  color,
}: {
  icon?: typeof Heart;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
      style={
        color
          ? { color, backgroundColor: `${color}22` }
          : undefined
      }
    >
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

export default function CharacterCard({
  character,
}: {
  character: CharacterWithCampaign;
}) {
  const full = character.hp_current >= character.hp_max;
  const hpColor = full ? "#4fbf8f" : "#bf4f4f";
  const campaignName = character.campaigns?.name;

  return (
    <div className="flex gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-lg bg-surface-2">
        <UserRound size={26} className="text-fg-muted" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-[16px] font-bold text-[#f0e8d8]">
            {character.name}
          </p>
          <button
            type="button"
            aria-label="Меню персонажа"
            className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-fg-muted active:text-fg"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        <p className="mt-0.5 text-xs text-fg-muted">
          Рівень {character.level} · {character.race} · {character.class}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge icon={Heart} color={hpColor}>
            {character.hp_current}/{character.hp_max}
          </Badge>
          <Badge icon={Shield} color="#c8843a">
            КЗ {character.ac}
          </Badge>
          {campaignName && (
            <span className="rounded-md border border-border px-2 py-0.5 text-[11px] text-fg-muted">
              {campaignName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
