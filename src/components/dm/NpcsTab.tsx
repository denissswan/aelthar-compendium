"use client";

import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import type { Npc } from "@/types";
import type { NpcInput } from "@/hooks/useNPCs";
import NpcCard from "@/components/NpcCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import BottomSheet from "@/components/ui/BottomSheet";

interface NpcsHook {
  data: Npc[];
  loading: boolean;
  create: (input: NpcInput) => Promise<{ error: string | null }>;
  update: (id: string, patch: Partial<Npc>) => Promise<{ error: string | null }>;
  remove: (id: string) => Promise<{ error: string | null }>;
  toggleVisible: (npc: Npc) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-[15px] text-fg placeholder:text-fg-dim focus:border-accent focus:outline-none";

function NpcForm({
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  initial: Npc | null;
  onSave: (input: NpcInput) => Promise<{ error: string | null }>;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [faction, setFaction] = useState(initial?.faction ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [publicInfo, setPublicInfo] = useState(initial?.public_info ?? "");
  const [secretNotes, setSecretNotes] = useState(initial?.secret_notes ?? "");
  const [visible, setVisible] = useState(initial?.is_visible_to_players ?? false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) return;
    setBusy(true);
    const res = await onSave({
      name: name.trim(),
      role: role.trim() || null,
      faction: faction.trim() || null,
      location: location.trim() || null,
      public_info: publicInfo.trim() || null,
      secret_notes: secretNotes.trim() || null,
      is_visible_to_players: visible,
    });
    setBusy(false);
    if (res.error) setError(res.error);
    else onClose();
  };

  return (
    <div className="flex flex-col gap-3 px-5 pb-8 pt-3">
      <h2 className="text-lg font-bold text-fg">
        {initial ? "Редагувати NPC" : "Новий NPC"}
      </h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Імʼя"
        className={inputClass}
      />
      <div className="flex gap-2">
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Роль"
          className={inputClass}
        />
        <input
          value={faction}
          onChange={(e) => setFaction(e.target.value)}
          placeholder="Фракція"
          className={inputClass}
        />
      </div>
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Локація"
        className={inputClass}
      />
      <textarea
        value={publicInfo}
        onChange={(e) => setPublicInfo(e.target.value)}
        placeholder="Публічна інформація (бачать гравці)"
        rows={3}
        className={`${inputClass} resize-none`}
      />
      <textarea
        value={secretNotes}
        onChange={(e) => setSecretNotes(e.target.value)}
        placeholder="Таємні нотатки (лише DM)"
        rows={3}
        className={`${inputClass} resize-none`}
      />
      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => setVisible(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        <span className="text-sm text-fg">Видимий гравцям</span>
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="button"
        onClick={save}
        disabled={busy || !name.trim()}
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
          Видалити NPC
        </button>
      )}
    </div>
  );
}

export default function NpcsTab({
  npcs,
  isDM,
}: {
  npcs: NpcsHook;
  isDM: boolean;
}) {
  const [form, setForm] = useState<{ npc: Npc | null } | null>(null);

  if (npcs.loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-2.5">
      {npcs.data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="NPC ще немає"
          description="Додайте першого персонажа, якого зустрінуть гравці."
        />
      ) : (
        npcs.data.map((npc) => (
          <NpcCard
            key={npc.id}
            npc={npc}
            isDM={isDM}
            onToggleVisible={() => npcs.toggleVisible(npc)}
            onEdit={isDM ? () => setForm({ npc }) : undefined}
          />
        ))
      )}

      {isDM && (
        <button
          type="button"
          onClick={() => setForm({ npc: null })}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-accent py-2.5 text-sm font-semibold text-accent active:bg-accent-dim"
        >
          <Plus size={16} />
          Додати NPC
        </button>
      )}

      <BottomSheet open={form !== null} onClose={() => setForm(null)}>
        {form && (
          <NpcForm
            initial={form.npc}
            onSave={(input) =>
              form.npc ? npcs.update(form.npc.id, input) : npcs.create(input)
            }
            onDelete={
              form.npc
                ? async () => {
                    await npcs.remove(form.npc!.id);
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
