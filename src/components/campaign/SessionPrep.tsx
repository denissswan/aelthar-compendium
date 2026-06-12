"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X, Check, Clock, Loader2 } from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

/**
 * DM-only session preparation workspace for the active campaign:
 *  1. Prep notes — autosaved (500ms debounce) to the latest session's dm_notes.
 *  2. Private prep checklist — persisted to localStorage.
 *  3. Live sticky notes — persisted to localStorage.
 */
export default function SessionPrep({
  campaignId,
  isDM,
}: {
  campaignId: string | undefined;
  isDM: boolean;
}) {
  if (!isDM) return null;
  return <SessionPrepInner campaignId={campaignId} />;
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-[15px] text-fg placeholder:text-fg-dim focus:border-accent focus:outline-none";

function uid(): string {
  return crypto.randomUUID();
}

function SessionPrepInner({ campaignId }: { campaignId: string | undefined }) {
  const sessions = useSessions(campaignId);

  if (sessions.loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-6">
      <PrepNotes sessions={sessions} />
      <PrepChecklist campaignId={campaignId} />
      <SessionStickies campaignId={campaignId} />
    </div>
  );
}

/* --------------------------- 1. Prep notes ------------------------------ */

function PrepNotes({ sessions }: { sessions: ReturnType<typeof useSessions> }) {
  const latest = sessions.data.length
    ? sessions.data[sessions.data.length - 1]
    : null;

  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const loadedId = useRef<string | null>(null);

  // Hydrate the textarea when the active session changes.
  useEffect(() => {
    if (latest && loadedId.current !== latest.id) {
      loadedId.current = latest.id;
      setNotes(latest.dm_notes ?? "");
      setSavedAt(null);
    }
  }, [latest]);

  // Debounced autosave into the active session's dm_notes.
  useEffect(() => {
    if (!latest || loadedId.current !== latest.id) return;
    if ((latest.dm_notes ?? "") === notes) return;
    setSaving(true);
    const t = setTimeout(async () => {
      await sessions.update(latest.id, { dm_notes: notes.length ? notes : null });
      setSaving(false);
      setSavedAt(new Date());
    }, 500);
    return () => clearTimeout(t);
  }, [notes, latest, sessions]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <SectionLabel>Нотатки до наступної сесії</SectionLabel>
        <SaveStatus saving={saving} savedAt={savedAt} />
      </div>
      {latest ? (
        <>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Що планую на цю сесію..."
            rows={7}
            className={`${inputClass} resize-none leading-relaxed`}
          />
          <p className="mt-1.5 text-[11px] text-fg-dim">
            Прив’язано до сесії №{latest.session_number}
            {latest.title ? ` · ${latest.title}` : ""}
          </p>
        </>
      ) : (
        <Card>
          <p className="text-sm text-fg-muted">
            Створіть сесію у вкладці «Сесії», щоб зберігати нотатки підготовки.
          </p>
        </Card>
      )}
    </div>
  );
}

function SaveStatus({
  saving,
  savedAt,
}: {
  saving: boolean;
  savedAt: Date | null;
}) {
  if (saving) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-fg-dim">
        <Loader2 size={11} className="animate-spin" />
        Збереження…
      </span>
    );
  }
  if (savedAt) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-success">
        <Clock size={11} />
        Збережено о {savedAt.toLocaleTimeString("uk-UA")}
      </span>
    );
  }
  return null;
}

/* --------------------------- 2. Checklist ------------------------------- */

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

const DEFAULT_CHECKLIST = [
  "Підготувати NPC діалоги",
  "Переглянути нотатки минулої сесії",
  "Підготувати карти/локації",
  "Продумати можливі рішення гравців",
];

function PrepChecklist({ campaignId }: { campaignId: string | undefined }) {
  const key = `dm_checklist_${campaignId}`;
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Load once on mount (localStorage is client-only → keep out of render).
  useEffect(() => {
    if (!campaignId) return;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        setItems(JSON.parse(raw) as ChecklistItem[]);
      } catch {
        setItems([]);
      }
    } else {
      setItems(DEFAULT_CHECKLIST.map((text) => ({ id: uid(), text, done: false })));
    }
    setLoaded(true);
  }, [key, campaignId]);

  // Persist after every change (but never the empty pre-load state).
  useEffect(() => {
    if (!loaded || !campaignId) return;
    localStorage.setItem(key, JSON.stringify(items));
  }, [items, loaded, key, campaignId]);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setItems((d) => [...d, { id: uid(), text, done: false }]);
    setDraft("");
  };
  const toggle = (id: string) =>
    setItems((d) => d.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const remove = (id: string) => setItems((d) => d.filter((i) => i.id !== id));
  const clearDone = () => setItems((d) => d.filter((i) => !i.done));

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <SectionLabel>Чеклист DM</SectionLabel>
        {doneCount > 0 && (
          <button
            type="button"
            onClick={clearDone}
            className="text-[11px] text-fg-dim active:text-accent"
          >
            Очистити виконані ({doneCount})
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-label={item.done ? "Зняти позначку" : "Позначити виконаним"}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                item.done
                  ? "border-success bg-success text-bg"
                  : "border-fg-dim text-transparent"
              }`}
            >
              <Check size={13} strokeWidth={3} />
            </button>
            <span
              className={`flex-1 text-sm ${
                item.done ? "text-fg-dim line-through" : "text-fg"
              }`}
            >
              {item.text}
            </span>
            <button
              type="button"
              onClick={() => remove(item.id)}
              aria-label="Видалити задачу"
              className="shrink-0 rounded-md p-1 text-fg-dim active:text-danger"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Нова задача…"
          className={inputClass}
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          aria-label="Додати задачу"
          className="flex shrink-0 items-center justify-center rounded-lg border border-accent px-3 text-accent active:bg-accent-dim disabled:opacity-50"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------- 3. Sticky notes ------------------------------ */

interface Sticky {
  id: string;
  text: string;
  color: string; // hex
}

const STICKY_COLORS = [
  { label: "Жовтий", hex: "#d9b54a" },
  { label: "Червоний", hex: "#bf4f4f" },
  { label: "Зелений", hex: "#4fbf8f" },
  { label: "Синій", hex: "#4f86bf" },
];

function SessionStickies({ campaignId }: { campaignId: string | undefined }) {
  const key = `dm_session_notes_${campaignId}`;
  const [notes, setNotes] = useState<Sticky[]>([]);
  const [draft, setDraft] = useState("");
  const [color, setColor] = useState(STICKY_COLORS[0].hex);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!campaignId) return;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        setNotes(JSON.parse(raw) as Sticky[]);
      } catch {
        setNotes([]);
      }
    }
    setLoaded(true);
  }, [key, campaignId]);

  useEffect(() => {
    if (!loaded || !campaignId) return;
    localStorage.setItem(key, JSON.stringify(notes));
  }, [notes, loaded, key, campaignId]);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setNotes((d) => [{ id: uid(), text, color }, ...d]);
    setDraft("");
  };
  const remove = (id: string) => setNotes((d) => d.filter((n) => n.id !== id));

  return (
    <div>
      <SectionLabel className="mb-2">Швидкі нотатки сесії</SectionLabel>

      <div className="rounded-lg border border-border bg-surface p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Нотатка під час гри…"
          rows={2}
          className="w-full resize-none bg-transparent text-[15px] text-fg placeholder:text-fg-dim focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {STICKY_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                aria-label={c.label}
                className={`h-6 w-6 rounded-full border-2 ${
                  color === c.hex ? "border-fg" : "border-transparent"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={add}
            disabled={!draft.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-bg disabled:opacity-50"
          >
            <Plus size={15} />
            Додати
          </button>
        </div>
      </div>

      {notes.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {notes.map((n) => (
            <div
              key={n.id}
              className="relative rounded-lg p-3 pr-7"
              style={{
                backgroundColor: `${n.color}1f`,
                border: `1px solid ${n.color}66`,
              }}
            >
              <button
                type="button"
                onClick={() => remove(n.id)}
                aria-label="Видалити нотатку"
                className="absolute right-1.5 top-1.5 rounded p-0.5 text-fg-dim active:text-danger"
              >
                <X size={14} />
              </button>
              <p className="whitespace-pre-wrap break-words text-[13px] leading-snug text-fg">
                {n.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
