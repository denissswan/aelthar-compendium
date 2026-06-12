"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Lock, Pencil, Eye, EyeOff, ScrollText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@/types";
import { useSessions, type SessionInput } from "@/hooks/useSessions";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import BottomSheet from "@/components/ui/BottomSheet";

type SessionsHook = ReturnType<typeof useSessions>;

/**
 * Full session log for a campaign.
 *
 * DM (isDM): CRUD over the `sessions` table with publish/draft state, sorted
 * newest-first. Consumes the campaign page's shared useSessions hook.
 * Player (!isDM): read-only published sessions via the protected
 * `sessions_public` view (no dm_notes).
 */
export default function SessionLog({
  campaignId,
  isDM,
  sessions,
}: {
  campaignId: string | undefined;
  isDM: boolean;
  /** Required in DM mode (shared hook from the campaign page). */
  sessions?: SessionsHook;
}) {
  if (isDM && sessions) return <DMSessionLog sessions={sessions} />;
  return <PlayerSessionLog campaignId={campaignId} />;
}

function formatDate(date: string): string {
  try {
    return new Intl.DateTimeFormat("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

/** Newest session first. */
function byNewest(a: Session, b: Session) {
  return b.session_number - a.session_number;
}

/* ------------------------------- DM view -------------------------------- */

function DMSessionLog({ sessions }: { sessions: SessionsHook }) {
  const [form, setForm] = useState<{ session: Session | null } | null>(null);

  const nextNumber =
    sessions.data.reduce((m, s) => Math.max(m, s.session_number), 0) + 1;
  const sorted = [...sessions.data].sort(byNewest);

  if (sessions.loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-2.5">
      {sorted.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Сесій ще немає"
          description="Запишіть першу проведену сесію."
        />
      ) : (
        sorted.map((s) => (
          <DMSessionCard
            key={s.id}
            session={s}
            onEdit={() => setForm({ session: s })}
            onTogglePublish={() =>
              sessions.update(s.id, { is_published: !s.is_published })
            }
            onDelete={() => sessions.remove(s.id)}
          />
        ))
      )}

      <button
        type="button"
        onClick={() => setForm({ session: null })}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-accent py-2.5 text-sm font-semibold text-accent active:bg-accent-dim"
      >
        <Plus size={16} />
        Нова сесія
      </button>

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
            onClose={() => setForm(null)}
          />
        )}
      </BottomSheet>
    </div>
  );
}

function DMSessionCard({
  session,
  onEdit,
  onTogglePublish,
  onDelete,
}: {
  session: Session;
  onEdit: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const published = session.is_published;

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold text-bg">
          {session.session_number}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-bold text-fg">{session.title}</p>
            <Badge
              label={published ? "Опубліковано" : "Чернетка"}
              color={published ? "#4fbf8f" : "#6b7280"}
              size="sm"
            />
          </div>
          {session.date && (
            <p className="mt-0.5 text-[11px] text-fg-dim">
              {formatDate(session.date)}
            </p>
          )}
        </div>
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-fg-dim">
              Короткий опис (бачать гравці)
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">
              {session.summary || "—"}
            </p>
          </div>

          {session.dm_notes && (
            <div className="rounded-lg border border-[#bf4f4f55] bg-[#bf4f4f14] p-3">
              <p className="mb-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-danger">
                <Lock size={10} />
                Тільки для DM
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#e0a8a8]">
                {session.dm_notes}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-sm text-fg-muted active:bg-surface-2"
            >
              <Pencil size={14} />
              Редагувати
            </button>
            <button
              type="button"
              onClick={onTogglePublish}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-semibold ${
                published
                  ? "border-border text-fg-dim active:bg-surface-2"
                  : "border-success text-success active:bg-[#4fbf8f1a]"
              }`}
            >
              {published ? <EyeOff size={14} /> : <Eye size={14} />}
              {published ? "Зняти з публікації" : "Опублікувати"}
            </button>
          </div>

          {confirmDelete ? (
            <div className="flex flex-col gap-2 rounded-lg border border-[#bf4f4f55] bg-[#bf4f4f14] p-3">
              <p className="text-sm text-fg">Видалити цю сесію назавжди?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-lg border border-border py-2 text-sm text-fg-muted active:bg-surface-2"
                >
                  Скасувати
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex-1 rounded-lg bg-danger py-2 text-sm font-semibold text-bg"
                >
                  Видалити
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center justify-center gap-1.5 text-sm text-danger"
            >
              <Trash2 size={15} />
              Видалити сесію
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

/* ----------------------------- Player view ------------------------------ */

function PlayerSessionLog({ campaignId }: { campaignId: string | undefined }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campaignId) {
      setSessions([]);
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      // sessions_public exposes only published sessions and omits dm_notes.
      const { data } = await supabase
        .from("sessions_public")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("is_published", true)
        .order("session_number", { ascending: false });
      if (!active) return;
      setSessions((data as Session[]) ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [campaignId]);

  if (loading) return <LoadingSpinner />;

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title="Сесії ще не опубліковані"
        description="Звіти про проведені сесії зʼявляться тут."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {sessions.map((s) => (
        <Card key={s.id}>
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold text-bg">
              {s.session_number}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-fg">{s.title}</p>
              {s.date && (
                <p className="mt-0.5 text-[11px] text-fg-dim">
                  {formatDate(s.date)}
                </p>
              )}
              {s.summary && (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">
                  {s.summary}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------ DM form --------------------------------- */

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-[15px] text-fg placeholder:text-fg-dim focus:border-accent focus:outline-none";

function SessionForm({
  initial,
  nextNumber,
  onSave,
  onClose,
}: {
  initial: Session | null;
  nextNumber: number;
  onSave: (input: SessionInput) => Promise<{ error: string | null }>;
  onClose: () => void;
}) {
  const [number, setNumber] = useState(initial?.session_number ?? nextNumber);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(
    (initial?.date ?? new Date().toISOString()).slice(0, 10),
  );
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [dmNotes, setDmNotes] = useState(initial?.dm_notes ?? "");
  const [published, setPublished] = useState(initial?.is_published ?? false);
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
      is_published: published,
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
        placeholder="Короткий опис для гравців"
        rows={3}
        className={`${inputClass} resize-none`}
      />
      <div>
        <p className="mb-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-danger">
          <Lock size={11} />
          Тільки для DM
        </p>
        <textarea
          value={dmNotes}
          onChange={(e) => setDmNotes(e.target.value)}
          placeholder="Нотатки DM — гравці цього не побачать"
          rows={3}
          className={`${inputClass} resize-none border-[#bf4f4f55] focus:border-danger`}
        />
      </div>
      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        <span className="text-sm text-fg">Опублікувати для гравців</span>
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="button"
        onClick={save}
        disabled={busy || !title.trim()}
        className="rounded-lg bg-accent py-2.5 text-sm font-semibold text-bg disabled:opacity-60"
      >
        Зберегти
      </button>
    </div>
  );
}
