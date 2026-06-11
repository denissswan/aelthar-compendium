"use client";

import { useMemo, useState } from "react";
import { Plus, X, Sparkles } from "lucide-react";
import type { CharacterSpellRow, Spell } from "@/types";
import { useCharacterSpells } from "@/hooks/useCharacterSpells";
import { useSpells } from "@/hooks/useSpells";
import { levelLabel } from "@/lib/spellFormat";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SearchBar from "@/components/ui/SearchBar";
import BottomSheet from "@/components/ui/BottomSheet";
import SpellDetailSheet from "@/components/SpellDetailSheet";
import SpellSlots from "@/components/sheet/SpellSlots";

function SpellRow({
  row,
  showPrepared,
  onOpen,
  onToggle,
  onRemove,
}: {
  row: CharacterSpellRow;
  showPrepared: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5">
      {showPrepared && (
        <input
          type="checkbox"
          checked={row.prepared}
          onChange={onToggle}
          aria-label="Підготовлено"
          className="h-4 w-4 accent-accent"
        />
      )}
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 text-left"
      >
        <span className="block truncate text-[15px] text-fg">
          {row.spells.name}
        </span>
        <span className="text-xs text-fg-muted">{row.spells.school}</span>
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Прибрати закляття"
        className="shrink-0 rounded-md p-1 text-fg-dim active:text-danger"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default function SpellsTab({ characterId }: { characterId: string }) {
  const { data, loading, togglePrepared, addSpell, removeSpell } =
    useCharacterSpells(characterId);
  const all = useSpells();
  const [detail, setDetail] = useState<Spell | null>(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");

  const cantrips = data.filter((r) => r.spells.level === 0);
  const byLevel = useMemo(() => {
    const groups: Record<number, CharacterSpellRow[]> = {};
    for (const r of data) {
      if (r.spells.level === 0) continue;
      (groups[r.spells.level] ??= []).push(r);
    }
    return groups;
  }, [data]);

  const ownedIds = new Set(data.map((r) => r.spell_id));
  const addable = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.data.filter(
      (s) => !ownedIds.has(s.id) && (q === "" || s.name.toLowerCase().includes(q)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all.data, search, data]);

  return (
    <div className="flex flex-col gap-4">
      <SpellSlots characterId={characterId} />

      <button
        type="button"
        onClick={() => setAdding(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent py-2.5 text-sm font-semibold text-accent active:bg-accent-dim"
      >
        <Plus size={18} />
        Додати закляття
      </button>

      {loading ? (
        <LoadingSpinner />
      ) : data.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Заклять ще немає"
          description="Додайте закляття з довідника."
        />
      ) : (
        <div className="flex flex-col gap-5">
          {cantrips.length > 0 && (
            <section>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
                Замовляння
              </p>
              <div className="flex flex-col gap-2">
                {cantrips.map((r) => (
                  <SpellRow
                    key={r.id}
                    row={r}
                    showPrepared={false}
                    onOpen={() => setDetail(r.spells)}
                    onToggle={() => togglePrepared(r)}
                    onRemove={() => removeSpell(r.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {Object.keys(byLevel)
            .map(Number)
            .sort((a, b) => a - b)
            .map((lvl) => (
              <section key={lvl}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
                  {levelLabel(lvl)}
                </p>
                <div className="flex flex-col gap-2">
                  {byLevel[lvl].map((r) => (
                    <SpellRow
                      key={r.id}
                      row={r}
                      showPrepared
                      onOpen={() => setDetail(r.spells)}
                      onToggle={() => togglePrepared(r)}
                      onRemove={() => removeSpell(r.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}

      <SpellDetailSheet spell={detail} onClose={() => setDetail(null)} />

      {/* Add-spell search sheet */}
      <BottomSheet open={adding} onClose={() => setAdding(false)}>
        <div className="flex flex-col gap-3 px-5 pb-8 pt-3">
          <h2 className="text-lg font-bold text-fg">Додати закляття</h2>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Пошук заклять…"
          />
          {all.loading ? (
            <LoadingSpinner />
          ) : addable.length === 0 ? (
            <p className="py-6 text-center text-sm text-fg-muted">
              Нічого не знайдено.
            </p>
          ) : (
            <div className="flex max-h-[55dvh] flex-col gap-2 overflow-y-auto">
              {addable.slice(0, 60).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={async () => {
                    await addSpell(s.id);
                    setAdding(false);
                    setSearch("");
                  }}
                  className="rounded-lg border border-border bg-surface px-3 py-2.5 text-left active:bg-surface-2"
                >
                  <span className="block text-[15px] text-fg">{s.name}</span>
                  <span className="text-xs text-accent">
                    {levelLabel(s.level)} · {s.school}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
