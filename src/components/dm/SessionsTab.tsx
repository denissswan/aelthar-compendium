"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Session } from "@/types";
import type { SessionInput } from "@/hooks/useSessions";
import SessionCard from "@/components/SessionCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import BottomSheet from "@/components/ui/BottomSheet";
import { ScrollText } from "lucide-react";

interface SessionsHook {
  data: Session[];
  loading: boolean;
  create: (input: SessionInput) => Promise<{ error: string | null }>;
  update: (id: string, patch: Partial<Session>) => Promise<{ error: string | null }>;
  remove: (id: string) => Promise<{ error: string | null }>;
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-[15px] text-fg placeholder:text-fg-dim focus:border-accent focus:outline-none";

function SessionForm({
  initial,
  nextNumber,
  onSave,
  onDelete,
  onClose,
}: {
  initial: Session | null;
  nextNumber: number;
  onSave: (input: SessionInput) => Promise<{ error: string | null }>;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [number, setNumber] = useState(initial?.session_number ?? nextNumber);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(
    (initial?.date ?? new Date().toISOString()).slice(0, 10),
  );
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [dmNotes, setDmNotes] = useState(initial?.dm_notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!title.trim()) return;
    setBusy(true);
    const res = await onSave({
      session_number: number,
      title: title.trim(),
      date,
      summary: summary.trim() || null,
      dm_notes: dmNotes.trim() || null,
    });
    setBusy(false);
    if (res.error) setError(res.error);
    else onClose();
  };

  return (
    <div className="flex flex-col gap-3 px-5 pb-8 pt-3">
      <h2 className="text-lg font-bold text-fg">
        {initial ? "Редагувати сесію" : "Нова сесія"}
      </h2>
      <div className="flex gap-2">
        <label className="flex w-20 flex-col gap-1">
          <span className="text-xs text-fg-muted">№</span>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(parseInt(e.target.value, 10) || 0)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-fg-muted">Дата</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Назва сесії"
        className={inputClass}
      />
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Опис подій (бачать гравці)"
        rows={3}
        className={`${inputClass} resize-none`}
      />
      <textarea
        value={dmNotes}
        onChange={(e) => setDmNotes(e.target.value)}
        placeholder="Нотатки DM (приховані)"
        rows={3}
        className={`${inputClass} resize-none`}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="button"
        onClick={save}
        disabled={busy || !title.trim()}
        className="rounded-lg bg-accent py-2.5 text-sm font-semibold text-bg disabled:opacity-60"
      >
        Зберегти
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center justify-center gap-1.5 text-sm text-danger"
        >
          <Trash2 size={15} />
          Видалити сесію
        </button>
      )}
    </div>
  );
}

export default function SessionsTab({
  sessions,
  isDM,
}: {
  sessions: SessionsHook;
  isDM: boolean;
}) {
  const [form, setForm] = useState<{ session: Session | null } | null>(null);

  const nextNumber =
    sessions.data.reduce((m, s) => Math.max(m, s.session_number), 0) + 1;

  if (sessions.loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-2.5">
      {sessions.data.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Сесій ще немає"
          description="Запишіть першу проведену сесію."
        />
      ) : (
        sessions.data.map((s) => (
          <SessionCard
            key={s.id}
            session={s}
            isDM={isDM}
            onEdit={isDM ? () => setForm({ session: s }) : undefined}
          />
        ))
      )}

      {isDM && (
        <button
          type="button"
          onClick={() => setForm({ session: null })}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-accent py-2.5 text-sm font-semibold text-accent active:bg-accent-dim"
        >
          <Plus size={16} />
          Додати сесію
        </button>
      )}

      <BottomSheet open={form !== null} onClose={() => setForm(null)}>
        {form && (
          <SessionForm
            initial={form.session}
            nextNumber={nextNumber}
            onSave={(input) =>
              form.session
                ? sessions.update(form.session.id, input)
                : sessions.create(input)
            }
            onDelete={
              form.session
                ? async () => {
                    await sessions.remove(form.session!.id);
                    setForm(null);
                  }
                : undefined
            }
            onClose={() => setForm(null)}
          />
        )}
      </BottomSheet>
    </div>
  );
}
