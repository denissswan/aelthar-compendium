"use client";

import { useState } from "react";
import { Coins, Plus, Trash2, ChevronDown, Backpack, Check } from "lucide-react";
import type { Character, InventoryItem } from "@/types";
import { ITEM_CATEGORIES } from "@/types";
import { useInventory, type NewItem } from "@/hooks/useInventory";
import NumberField from "@/components/sheet/NumberField";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import BottomSheet from "@/components/ui/BottomSheet";

function Coin({
  label,
  color,
  value,
  onChange,
}: {
  label: string;
  color: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5">
      <Coins size={16} style={{ color }} />
      <NumberField
        value={value}
        onChange={onChange}
        ariaLabel={label}
        className="w-full text-sm font-semibold text-fg"
      />
    </div>
  );
}

function ItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: InventoryItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={onToggle}
          aria-label={item.equipped ? "Зняти" : "Екіпірувати"}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border"
          style={{
            borderColor: item.equipped ? "#c8843a" : "#1e2130",
            backgroundColor: item.equipped ? "#c8843a" : "transparent",
          }}
        >
          {item.equipped && <Check size={13} className="text-bg" />}
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="min-w-0 flex-1 truncate text-[15px] text-fg">
            {item.name}
            {item.quantity > 1 && (
              <span className="text-fg-muted"> ×{item.quantity}</span>
            )}
          </span>
          {item.category && <Badge label={item.category} size="sm" />}
          <ChevronDown
            size={16}
            className={`shrink-0 text-fg-dim transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-3 py-2.5">
          {item.description ? (
            <p className="text-[13px] leading-relaxed text-fg-muted">
              {item.description}
            </p>
          ) : (
            <p className="text-[13px] italic text-fg-dim">Без опису</p>
          )}
          {confirming ? (
            <div className="mt-2 flex items-center gap-3 text-xs">
              <span className="text-danger">Видалити предмет?</span>
              <button
                type="button"
                onClick={onDelete}
                className="font-semibold text-danger active:opacity-70"
              >
                Так
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="text-fg-muted active:text-fg"
              >
                Скасувати
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-danger"
            >
              <Trash2 size={14} />
              Видалити
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM: NewItem = {
  name: "",
  description: "",
  quantity: 1,
  category: "Інше",
  equipped: false,
};

export default function InventoryTab({
  character,
  onChange,
}: {
  character: Character;
  onChange: (patch: Partial<Character>) => void;
}) {
  const { data, loading, addItem, deleteItem, toggleEquipped } = useInventory(
    character.id,
  );
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<NewItem>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!form.name.trim()) return;
    setBusy(true);
    await addItem({ ...form, name: form.name.trim() });
    setBusy(false);
    setForm(EMPTY_FORM);
    setAdding(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Currency */}
      <div className="flex gap-2">
        <Coin
          label="Золото"
          color="#c8843a"
          value={character.gold}
          onChange={(v) => onChange({ gold: v })}
        />
        <Coin
          label="Срібло"
          color="#9aa0aa"
          value={character.silver}
          onChange={(v) => onChange({ silver: v })}
        />
        <Coin
          label="Мідь"
          color="#a8693a"
          value={character.copper}
          onChange={(v) => onChange({ copper: v })}
        />
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent py-2.5 text-sm font-semibold text-accent active:bg-accent-dim"
      >
        <Plus size={18} />
        Додати предмет
      </button>

      {/* List */}
      {loading ? (
        <LoadingSpinner />
      ) : data.length === 0 ? (
        <EmptyState
          icon={Backpack}
          title="Інвентар порожній"
          description="Додайте перший предмет до спорядження персонажа."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {data.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={() => toggleEquipped(item)}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
        </div>
      )}

      {/* Add sheet */}
      <BottomSheet open={adding} onClose={() => setAdding(false)}>
        <div className="flex flex-col gap-3 px-5 pb-8 pt-3">
          <h2 className="text-lg font-bold text-fg">Новий предмет</h2>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Назва"
            className="rounded-lg border border-border bg-surface px-3 py-2.5 text-[15px] text-fg placeholder:text-fg-dim focus:border-accent focus:outline-none"
          />
          <textarea
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Опис (необовʼязково)"
            rows={3}
            className="resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-[15px] text-fg placeholder:text-fg-dim focus:border-accent focus:outline-none"
          />
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-fg-muted">Кількість</span>
              <NumberField
                value={form.quantity}
                onChange={(v) => setForm({ ...form, quantity: Math.max(1, v) })}
                className="rounded-lg border border-border py-2 text-fg"
              />
            </label>
            <label className="flex flex-[2] flex-col gap-1">
              <span className="text-xs text-fg-muted">Категорія</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-[15px] text-fg focus:border-accent focus:outline-none"
              >
                {ITEM_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2.5">
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
            disabled={busy || !form.name.trim()}
            className="mt-1 rounded-lg bg-accent py-3 text-sm font-semibold text-bg disabled:opacity-60"
          >
            Додати
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
