"use client";

import { Lock, Eye, EyeOff, Pencil } from "lucide-react";
import type { Npc } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function NpcCard({
  npc,
  isDM,
  onToggleVisible,
  onEdit,
}: {
  npc: Npc;
  isDM: boolean;
  onToggleVisible: (id: string) => void;
  onEdit?: () => void;
}) {
  const hasSecret = isDM && !!npc.secret_notes;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-bold text-fg">{npc.name}</p>
            {hasSecret && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#bf4f4f22] px-1.5 py-0.5 text-[10px] font-semibold text-danger">
                <Lock size={10} />
                DM
              </span>
            )}
          </div>
          {npc.role && <p className="text-xs text-fg-muted">{npc.role}</p>}
          {npc.faction && (
            <div className="mt-1.5">
              <Badge label={npc.faction} size="sm" />
            </div>
          )}
        </div>

        {isDM && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleVisible(npc.id)}
              aria-label={
                npc.is_visible_to_players
                  ? "Сховати від гравців"
                  : "Показати гравцям"
              }
              className={`rounded-md p-1.5 ${
                npc.is_visible_to_players ? "text-success" : "text-fg-dim"
              }`}
            >
              {npc.is_visible_to_players ? (
                <Eye size={18} />
              ) : (
                <EyeOff size={18} />
              )}
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                aria-label="Редагувати NPC"
                className="rounded-md p-1.5 text-fg-dim active:text-accent"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
