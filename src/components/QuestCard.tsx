"use client";

import { Pencil } from "lucide-react";
import type { Quest, QuestStatus } from "@/types";
import Card from "@/components/ui/Card";

export const QUEST_STATUS: Record<
  QuestStatus,
  { label: string; color: string }
> = {
  active: { label: "Активний", color: "#c8843a" },
  completed: { label: "Завершений", color: "#4fbf8f" },
  failed: { label: "Провалений", color: "#bf4f4f" },
};

export default function QuestCard({
  quest,
  onEdit,
}: {
  quest: Quest;
  onEdit?: () => void;
}) {
  const status = QUEST_STATUS[quest.status] ?? QUEST_STATUS.active;
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-fg">{quest.title}</p>
          {quest.giver && (
            <p className="mt-0.5 text-xs text-fg-muted">Від: {quest.giver}</p>
          )}
          {quest.description && (
            <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
              {quest.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
            style={{ color: status.color, backgroundColor: `${status.color}22` }}
          >
            {status.label}
          </span>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label="Редагувати квест"
              className="rounded-md p-1 text-fg-dim active:text-accent"
            >
              <Pencil size={14} />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
