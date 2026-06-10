"use client";

import type { ChurchRelation, Race } from "@/types";

const RELATION_COLOR: Record<ChurchRelation, string> = {
  Вороже: "#bf4f4f",
  Нейтрально: "#c8843a",
  Більшість: "#4fbf8f",
};

function ChurchBadge({ relation }: { relation: ChurchRelation }) {
  const color = RELATION_COLOR[relation];
  return (
    <span
      className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
      style={{ color, backgroundColor: `${color}22` }}
    >
      {relation}
    </span>
  );
}

export default function RaceCard({ race }: { race: Race }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] font-bold text-fg">{race.name}</p>
        {race.church_relation && (
          <ChurchBadge relation={race.church_relation} />
        )}
      </div>
      {race.region && (
        <p className="mt-0.5 text-xs text-accent">{race.region}</p>
      )}
      {race.description && (
        <p className="mt-1 text-sm leading-relaxed text-fg-muted">
          {race.description}
        </p>
      )}
    </div>
  );
}
