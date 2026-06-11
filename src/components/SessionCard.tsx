"use client";

import { Lock, Pencil } from "lucide-react";
import type { Session } from "@/types";
import Card from "@/components/ui/Card";

function formatDate(date: string): string {
  try {
    return new Intl.DateTimeFormat("uk-UA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export default function SessionCard({
  session,
  isDM,
  onEdit,
}: {
  session: Session;
  isDM: boolean;
  onEdit?: () => void;
}) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold text-bg">
          {session.session_number}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[15px] font-bold text-fg">{session.title}</p>
            <div className="flex shrink-0 items-center gap-2">
              {session.date && (
                <span className="text-[11px] text-fg-dim">
                  {formatDate(session.date)}
                </span>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  aria-label="Редагувати сесію"
                  className="rounded-md p-1 text-fg-dim active:text-accent"
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>
          </div>
          {session.summary && (
            <p className="mt-1 line-clamp-2 text-[13px] text-fg-muted">
              {session.summary}
            </p>
          )}
          {isDM && session.dm_notes && (
            <div className="mt-2 flex items-start gap-1.5 rounded-md border border-border bg-surface-2 p-2">
              <Lock size={13} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-[12px] text-fg-muted">{session.dm_notes}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
