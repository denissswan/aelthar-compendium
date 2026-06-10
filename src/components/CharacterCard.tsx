"use client";

import { useRouter } from "next/navigation";
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
      style={color ? { color, backgroundColor: `${color}22` } : undefined}
    >
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

function HpBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const color =
    current >= max ? "#4fbf8f" : pct < 0.5 ? "#bf4f4f" : "#e0913a";
  return (
    <div className="mt-2 h-[3px] w-full rounded-[2px] bg-surface-2">
      <div
        className="h-full rounded-[2px] transition-[width] duration-500 ease-out"
        style={{ width: `${pct * 100}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function CharacterCard({
  character,
  isActive = false,
}: {
  character: CharacterWithCampaign;
  isActive?: boolean;
}) {
  const router = useRouter();
  const full = character.hp_current >= character.hp_max;
  const hpColor = full ? "#4fbf8f" : "#bf4f4f";
  const campaignName = character.campaigns?.name;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/characters/${character.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/characters/${character.id}`);
      }}
      className="relative flex cursor-pointer gap-3 rounded-lg bg-surface p-4"
      style={
        isActive
          ? {
              border: "1px solid #c8843a55",
              borderLeft: "3px solid #c8843a",
            }
          : { border: "1px solid var(--color-border)" }
      }
    >
      {isActive && (
        <span className="absolute right-3 top-3 text-[10px] font-semibold text-accent">
          ⚔ Активний
        </span>
      )}

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
            onClick={(e) => e.stopPropagation()}
            className={`-mt-1 shrink-0 rounded-md p-1 text-fg-muted active:text-fg ${
              isActive ? "mr-16" : "-mr-1"
            }`}
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

        <HpBar current={character.hp_current} max={character.hp_max} />
      </div>
    </div>
  );
}
