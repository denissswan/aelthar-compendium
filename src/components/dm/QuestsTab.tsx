"use client";

import { useState } from "react";
import { Plus, Trash2, ClipboardList } from "lucide-react";
import type { Quest, QuestStatus } from "@/types";
import type { QuestInput } from "@/hooks/useQuests";
import QuestCard, { QUEST_STATUS } from "@/components/QuestCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import BottomSheet from "@/components/ui/BottomSheet";

interface QuestsHook {
  data: Quest[];
  loading: boolean;
  create: (input: QuestInput) => Promise<{ error: string | null }>;
  update: (id: string, patch: Partial<Quest>) => Promise<{ error: string | null }>;
  remove: (id: string) => Promise<{ error: string | null }>;
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-[15px] text-fg placeholder:text-fg-dim focus:border-accent focus:outline-none";

const STATUSES: QuestStatus[] = ["active", "completed", "failed"];

function QuestForm({
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  initial: Quest | null;
  onSave: (input: QuestInput) => Promise<{ error: string | null }>;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [giver, setGiver] = useState(initial?.giver ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<QuestStatus>(initial?.status ?? "active");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!title.trim()) return;
    setBusy(true);
    const res = await onSave({
      title: title.trim(),
      giver: giver.trim() || null,
      description: description.trim() || null,
      status,
    });
    setBusy(false);
    if (res.error) setError(res.error);
    else onClose();
  };

  return (
    <div className="flex flex-col gap-3 px-5 pb-8 pt-3">
      <h2 className="text-lg font-bold text-fg">
        {initial ? "Редагувати квест" : "Новий квест"}
      </h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Назва квесту"
        className={inputClass}
      />
      <input
        value={giver}
        onChange={(e) => setGiver(e.target.value)}
        placeholder="Від кого (видавець)"
        className={inputClass}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Опис"
        rows={3}
        className={`${inputClass} resize-none`}
      />
      <div className="flex gap-2">
        {STATUSES.map((s) => {
          const on = status === s;
          const c = QUEST_STATUS[s];
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className="flex-1 rounded-lg border py-2 text-sm font-semibold"
              style={{
                borderColor: on ? c.color : "#1e2130",
                color: on ? c.color : "#7a8090",
                backgroundColor: on ? `${c.color}22` : "transparent",
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>
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
          Видалити квест
        </button>
      )}
    </div>
  );
}

export default function QuestsTab({
  quests,
  isDM,
}: {
  quests: QuestsHook;
  isDM: boolean;
}) {
  const [form, setForm] = useState<{ quest: Quest | null } | null>(null);

  if (quests.loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-2.5">
      {quests.data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Квестів ще немає"
          description="Додайте перше завдання для гравців."
        />
      ) : (
        quests.data.map((q) => (
          <QuestCard
            key={q.id}
            quest={q}
            onEdit={isDM ? () => setForm({ quest: q }) : undefined}
          />
        ))
      )}

      {isDM && (
        <button
          type="button"
          onClick={() => setForm({ quest: null })}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-accent py-2.5 text-sm font-semibold text-accent active:bg-accent-dim"
        >
          <Plus size={16} />
          Додати квест
        </button>
      )}

      <BottomSheet open={form !== null} onClose={() => setForm(null)}>
        {form && (
          <QuestForm
            initial={form.quest}
            onSave={(input) =>
              form.quest
                ? quests.update(form.quest.id, input)
                : quests.create(input)
            }
            onDelete={
              form.quest
                ? async () => {
                    await quests.remove(form.quest!.id);
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
