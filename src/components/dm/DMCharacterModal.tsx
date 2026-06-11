"use client";

import { useRef, useState } from "react";
import { X, Plus, Minus, Trash2, Heart } from "lucide-react";
import type { Character } from "@/types";
import { ITEM_CATEGORIES } from "@/types";
import {
  ABILITIES,
  SKILLS,
  abilityModifier,
  formatModifier,
  proficiencyBonus,
} from "@/lib/dnd";
import { useInventory, type NewItem } from "@/hooks/useInventory";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import BottomSheet from "@/components/ui/BottomSheet";
import TabBar from "@/components/ui/TabBar";
import Badge from "@/components/ui/Badge";
import NumberField from "@/components/sheet/NumberField";
import { characterStatus } from "@/components/dm/PartyCard";

type UpdateFn = (
  id: string,
  patch: Partial<Character>,
) => Promise<{ error: string | null }>;

const TABS = [
  { key: "control", label: "Керування" },
  { key: "inventory", label: "Інвентар" },
  { key: "info", label: "Інфо" },
];

const CONDITIONS = [
  "Отруєний",
  "Паралізований",
  "Засліплений",
  "Приголомшений",
  "Наляканий",
  "Невидимий",
  "Концентрація",
];

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export default function DMCharacterModal({
  character,
  onClose,
  onUpdate,
}: {
  character: Character | null;
  onClose: () => void;
  onUpdate: UpdateFn;
}) {
  return (
    <BottomSheet open={character !== null} onClose={onClose}>
      {character && (
        <Content character={character} onClose={onClose} onUpdate={onUpdate} />
      )}
    </BottomSheet>
  );
}

function Content({
  character,
  onClose,
  onUpdate,
}: {
  character: Character;
  onClose: () => void;
  onUpdate: UpdateFn;
}) {
  const [tab, setTab] = useState("control");
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = (res: { error: string | null }) => {
    const ok = !res.error;
    setToast({ ok, msg: ok ? "Збережено" : "Помилка збереження" });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1600);
  };

  const patch = (p: Partial<Character>) => onUpdate(character.id, p).then(notify);

  return (
    <div className="px-5 pb-8 pt-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-fg">{character.name}</h2>
          <p className="text-xs text-fg-muted">
            {[character.race, character.class, `Рівень ${character.level}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрити"
          className="rounded-full p-1 text-fg-muted active:text-fg"
        >
          <X size={22} />
        </button>
      </div>

      <div className="mt-3">
        <TabBar tabs={TABS} active={tab} onChange={setTab} />
      </div>

      <div className="mt-4">
        {tab === "control" && (
          <ControlTab character={character} patch={patch} notify={notify} />
        )}
        {tab === "inventory" && (
          <InventoryTab character={character} notify={notify} />
        )}
        {tab === "info" && <InfoTab character={character} />}
      </div>

      {toast && (
        <div className="fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4">
          <div
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={{
              color: toast.ok ? "#4fbf8f" : "#bf4f4f",
              backgroundColor: toast.ok ? "#4fbf8f22" : "#bf4f4f22",
              border: `1px solid ${toast.ok ? "#4fbf8f" : "#bf4f4f"}`,
            }}
          >
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Керування -------------------------------- */

function ControlTab({
  character,
  patch,
  notify,
}: {
  character: Character;
  patch: (p: Partial<Character>) => void;
  notify: (res: { error: string | null }) => void;
}) {
  const [exact, setExact] = useState("");
  const [confirmLevel, setConfirmLevel] = useState(false);
  const [loot, setLoot] = useState({ gold: 0, silver: 0, copper: 0 });
  const [conditions, setConditions] = useLocalStorage<string[]>(
    STORAGE_KEYS.conditions(character.id),
    [],
  );

  const applyHp = (delta: number) =>
    patch({ hp_current: clamp(character.hp_current + delta, 0, character.hp_max) });

  const toggleCondition = (c: string) => {
    setConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
    notify({ error: null });
  };

  const addLoot = () => {
    patch({
      gold: character.gold + loot.gold,
      silver: character.silver + loot.silver,
      copper: character.copper + loot.copper,
    });
    setLoot({ gold: 0, silver: 0, copper: 0 });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* HP */}
      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
          Здоровʼя
        </p>
        <div className="flex items-center justify-center gap-2">
          <Heart size={20} className="text-danger" />
          <span className="text-3xl font-bold tabular-nums text-fg">
            {character.hp_current}
          </span>
          <span className="text-xl text-fg-dim">/ {character.hp_max}</span>
        </div>
        <div className="mt-3 grid grid-cols-6 gap-1.5">
          {[-10, -5, -1, 1, 5, 10].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => applyHp(d)}
              className={`rounded-md border py-2 text-sm font-semibold ${
                d < 0
                  ? "border-danger text-danger"
                  : "border-success text-success"
              }`}
            >
              {d > 0 ? `+${d}` : d}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={exact}
            onChange={(e) => setExact(e.target.value)}
            placeholder="Точне значення"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-dim focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (exact === "") return;
              patch({
                hp_current: clamp(parseInt(exact, 10) || 0, 0, character.hp_max),
              });
              setExact("");
            }}
            className="shrink-0 rounded-lg border border-border px-3 text-sm text-fg-muted"
          >
            Встановити
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => patch({ hp_current: character.hp_max })}
            className="flex-1 rounded-lg border border-success py-2 text-sm font-semibold text-success active:bg-[#4fbf8f22]"
          >
            Повне зцілення
          </button>
          <label className="flex items-center gap-2 rounded-lg border border-border px-3">
            <span className="text-xs text-fg-muted">Тимч.</span>
            <NumberField
              value={character.hp_temp ?? 0}
              onChange={(v) => patch({ hp_temp: v })}
              className="w-10 text-fg"
              ariaLabel="Тимчасові HP"
            />
          </label>
        </div>
      </section>

      {/* Level up */}
      <section>
        {confirmLevel ? (
          <div className="rounded-lg border border-accent bg-accent-dim p-3">
            <p className="text-sm text-fg">
              Підвищити рівень {character.name} до {character.level + 1}?
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  patch({ level: character.level + 1 });
                  setConfirmLevel(false);
                }}
                className="flex-1 rounded-md bg-accent py-2 text-sm font-semibold text-bg"
              >
                Так
              </button>
              <button
                type="button"
                onClick={() => setConfirmLevel(false)}
                className="flex-1 rounded-md border border-border py-2 text-sm text-fg-muted"
              >
                Скасувати
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmLevel(true)}
            className="w-full rounded-lg border border-accent py-2.5 text-sm font-semibold text-accent active:bg-accent-dim"
          >
            Підвищити рівень → {character.level + 1}
          </button>
        )}
      </section>

      {/* Conditions */}
      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
          Стани
        </p>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => {
            const on = conditions.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCondition(c)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  on
                    ? "border-accent bg-accent-dim text-accent"
                    : "border-border text-fg-muted"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </section>

      {/* Loot */}
      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
          Видати здобич
        </p>
        <div className="flex gap-2">
          {(["gold", "silver", "copper"] as const).map((k) => (
            <label
              key={k}
              className="flex flex-1 flex-col items-center rounded-lg border border-border bg-surface py-1.5"
            >
              <span className="text-[10px] uppercase text-fg-muted">
                {k === "gold" ? "Зол." : k === "silver" ? "Срб." : "Мід."}
              </span>
              <NumberField
                value={loot[k]}
                onChange={(v) => setLoot({ ...loot, [k]: Math.max(0, v) })}
                className="w-12 text-fg"
                ariaLabel={k}
              />
            </label>
          ))}
          <button
            type="button"
            onClick={addLoot}
            className="shrink-0 rounded-lg bg-accent px-4 text-sm font-semibold text-bg"
          >
            Додати
          </button>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------- Інвентар --------------------------------- */

const EMPTY_FORM: NewItem = {
  name: "",
  description: "",
  quantity: 1,
  category: "Інше",
  equipped: false,
};

function InventoryTab({
  character,
  notify,
}: {
  character: Character;
  notify: (res: { error: string | null }) => void;
}) {
  const { data, loading, addItem, deleteItem } = useInventory(character.id);
  const [form, setForm] = useState<NewItem>(EMPTY_FORM);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const submit = async () => {
    if (!form.name.trim()) return;
    const res = await addItem({ ...form, name: form.name.trim() });
    notify(res);
    if (!res.error) setForm(EMPTY_FORM);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Current inventory */}
      <div className="flex flex-col gap-2">
        {loading ? (
          <p className="text-center text-sm text-fg-muted">Завантаження…</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-fg-dim">Інвентар порожній.</p>
        ) : (
          data.map((it) => (
            <div
              key={it.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] text-fg">
                  {it.name}
                  {it.quantity > 1 && (
                    <span className="text-fg-muted"> ×{it.quantity}</span>
                  )}
                  {it.equipped && (
                    <span className="text-success"> · екіп.</span>
                  )}
                </p>
                {it.category && (
                  <Badge label={it.category} size="sm" />
                )}
              </div>
              {pendingDelete === it.id ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await deleteItem(it.id);
                      notify(res);
                      setPendingDelete(null);
                    }}
                    className="rounded-md bg-danger px-2 py-1 text-xs font-semibold text-bg"
                  >
                    Видалити
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(null)}
                    className="px-1 text-xs text-fg-muted"
                  >
                    Ні
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPendingDelete(it.id)}
                  aria-label="Видалити"
                  className="shrink-0 rounded-md p-1 text-fg-dim active:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add item form */}
      <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
          Додати предмет
        </p>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Назва"
          className="rounded-lg border border-border bg-surface px-3 py-2 text-[15px] text-fg placeholder:text-fg-dim focus:border-accent focus:outline-none"
        />
        <textarea
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Опис"
          rows={2}
          className="resize-none rounded-lg border border-border bg-surface px-3 py-2 text-[15px] text-fg placeholder:text-fg-dim focus:border-accent focus:outline-none"
        />
        <div className="flex gap-2">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-fg-muted">К-сть</span>
            <NumberField
              value={form.quantity}
              onChange={(v) => setForm({ ...form, quantity: Math.max(1, v) })}
              className="rounded-lg border border-border py-1.5 text-fg"
            />
          </label>
          <label className="flex flex-[2] flex-col gap-1">
            <span className="text-xs text-fg-muted">Категорія</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-lg border border-border bg-surface px-2 py-1.5 text-[15px] text-fg focus:border-accent focus:outline-none"
            >
              {ITEM_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.equipped}
            onChange={(e) => setForm({ ...form, equipped: e.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          <span className="text-sm text-fg">Екіпіровано</span>
        </label>
        <button
          type="button"
          onClick={submit}
          disabled={!form.name.trim()}
          className="rounded-lg bg-accent py-2.5 text-sm font-semibold text-bg disabled:opacity-60"
        >
          Додати предмет
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- Інфо ----------------------------------- */

function InfoBlock({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
        {title}
      </p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-fg">
        {text}
      </p>
    </div>
  );
}

function InfoTab({ character }: { character: Character }) {
  const pb = proficiencyBonus(character.level);
  const prof = character.proficiencies ?? { saves: [], skills: [] };

  return (
    <div className="flex flex-col gap-5">
      {/* Abilities */}
      <div className="grid grid-cols-3 gap-2">
        {ABILITIES.map((a) => {
          const mod = abilityModifier(character[a.key]);
          return (
            <div
              key={a.key}
              className="flex flex-col items-center rounded-lg border border-border bg-surface py-2"
            >
              <span className="text-[10px] uppercase text-fg-muted">
                {a.short}
              </span>
              <span className="text-lg font-bold text-fg">
                {character[a.key]}
              </span>
              <span className="text-xs text-accent">{formatModifier(mod)}</span>
            </div>
          );
        })}
      </div>

      {/* Saves */}
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
          Рятівні кидки
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ABILITIES.map((a) => {
            const on = prof.saves.includes(a.key);
            const mod = abilityModifier(character[a.key]) + (on ? pb : 0);
            return (
              <span
                key={a.key}
                className={`rounded-md px-2 py-0.5 text-xs ${
                  on ? "bg-accent-dim text-accent" : "text-fg-muted"
                }`}
              >
                {a.short} {formatModifier(mod)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
          Навички
        </p>
        <div className="overflow-hidden rounded-lg border border-border">
          {SKILLS.map((s, i) => {
            const on = prof.skills.includes(s.key);
            const mod = abilityModifier(character[s.ability]) + (on ? pb : 0);
            return (
              <div
                key={s.key}
                className={`flex items-center justify-between px-3 py-1.5 text-sm ${
                  i > 0 ? "border-t border-border" : ""
                } ${on ? "text-accent" : "text-fg-muted"}`}
              >
                <span>{s.label}</span>
                <span className="tabular-nums">{formatModifier(mod)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <InfoBlock title="Передісторія" text={character.backstory} />
      <InfoBlock title="Риси характеру" text={character.personality_traits} />
      <InfoBlock title="Мови та вміння" text={character.languages} />
      <InfoBlock title="Нотатки" text={character.notes} />
    </div>
  );
}
