"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Pencil,
  Lock,
  MapPin,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Npc } from "@/types";
import { useNPCs, type NpcInput } from "@/hooks/useNPCs";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import BottomSheet from "@/components/ui/BottomSheet";

/**
 * Full NPC system for a campaign.
 *
 * DM (isDM): full CRUD over the `npcs` table — list, expandable secret notes,
 * visibility toggle, add/edit form, delete with confirmation.
 * Player (!isDM): read-only list of visible NPCs read through the protected
 * `npcs_public` view (no secret_notes leaks).
 */
export default function NPCSystem({
  campaignId,
  isDM,
}: {
  campaignId: string | undefined;
  isDM: boolean;
}) {
  // Branch into a dedicated component so each side calls its own hooks
  // unconditionally (Rules of Hooks). isDM is stable for the page lifetime.
  if (isDM) return <DMNpcs campaignId={campaignId} />;
  return <PlayerNpcs campaignId={campaignId} />;
}

/* ------------------------------- DM view -------------------------------- */

function DMNpcs({ campaignId }: { campaignId: string | undefined }) {
  const npcs = useNPCs(campaignId);
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
          <DMNpcCard
            key={npc.id}
            npc={npc}
            onToggleVisible={() => npcs.toggleVisible(npc)}
            onEdit={() => setForm({ npc })}
          />
        ))
      )}

      <button
        type="button"
        onClick={() => setForm({ npc: null })}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-accent py-2.5 text-sm font-semibold text-accent active:bg-accent-dim"
      >
        <Plus size={16} />
        Додати NPC
      </button>

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

function DMNpcCard({
  npc,
  onToggleVisible,
  onEdit,
}: {
  npc: Npc;
  onToggleVisible: () => void;
  onEdit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const visible = npc.is_visible_to_players;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        {/* Tap the body to expand details. */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-bold text-fg">{npc.name}</p>
            <Badge
              label={visible ? "Видимий гравцям" : "Прихований"}
              color={visible ? "#4fbf8f" : "#6b7280"}
              size="sm"
            />
          </div>
          {npc.role && <p className="mt-0.5 text-xs text-fg-muted">{npc.role}</p>}
          <NpcMeta npc={npc} />
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onToggleVisible}
            aria-label={visible ? "Приховати" : "Показати гравцям"}
            className={`rounded-md p-1.5 ${
              visible ? "text-success" : "text-fg-dim"
            }`}
          >
            {visible ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Редагувати NPC"
            className="rounded-md p-1.5 text-fg-dim active:text-accent"
          >
            <Pencil size={16} />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-fg-dim">
              Публічна інформація
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">
              {npc.public_info || "—"}
            </p>
          </div>

          {npc.secret_notes && (
            <div className="rounded-lg border border-[#bf4f4f55] bg-[#bf4f4f14] p-3">
              <p className="mb-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-danger">
                <Lock size={10} />
                Секретно
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#e0a8a8]">
                {npc.secret_notes}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleVisible}
            className={`rounded-lg border py-2 text-sm font-semibold ${
              visible
                ? "border-border text-fg-dim active:bg-surface-2"
                : "border-success text-success active:bg-[#4fbf8f1a]"
            }`}
          >
            {visible ? "Приховати" : "Показати гравцям"}
          </button>
        </div>
      )}
    </Card>
  );
}

/* ----------------------------- Player view ------------------------------ */

function PlayerNpcs({ campaignId }: { campaignId: string | undefined }) {
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campaignId) {
      setNpcs([]);
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      // npcs_public exposes only visible NPCs and omits secret_notes.
      const { data } = await supabase
        .from("npcs_public")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("name", { ascending: true });
      if (!active) return;
      setNpcs((data as Npc[]) ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [campaignId]);

  if (loading) return <LoadingSpinner />;

  if (npcs.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="NPC ще немає"
        description="Персонажі, яких ви зустріли, зʼявляться тут."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {npcs.map((npc) => (
        <Card key={npc.id}>
          <p className="text-[15px] font-bold text-fg">{npc.name}</p>
          {npc.role && <p className="mt-0.5 text-xs text-fg-muted">{npc.role}</p>}
          <NpcMeta npc={npc} />
          {npc.public_info && (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">
              {npc.public_info}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------- Shared --------------------------------- */

/** Faction badge + location row, shown on every NPC card. */
function NpcMeta({ npc }: { npc: Npc }) {
  if (!npc.faction && !npc.location) return null;
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2">
      {npc.faction && <Badge label={npc.faction} size="sm" />}
      {npc.location && (
        <span className="inline-flex items-center gap-1 text-[11px] text-fg-dim">
          <MapPin size={11} />
          {npc.location}
        </span>
      )}
    </div>
  );
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
  const [visible, setVisible] = useState(
    initial?.is_visible_to_players ?? false,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
      <div>
        <p className="mb-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-danger">
          <Lock size={11} />
          Секретні нотатки
        </p>
        <textarea
          value={secretNotes}
          onChange={(e) => setSecretNotes(e.target.value)}
          placeholder="Лише для DM — гравці цього не побачать"
          rows={3}
          className={`${inputClass} resize-none border-[#bf4f4f55] focus:border-danger`}
        />
      </div>
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

      {onDelete &&
        (confirmDelete ? (
          <div className="flex flex-col gap-2 rounded-lg border border-[#bf4f4f55] bg-[#bf4f4f14] p-3">
            <p className="text-sm text-fg">Видалити цього NPC назавжди?</p>
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
            Видалити NPC
          </button>
        ))}
    </div>
  );
}
