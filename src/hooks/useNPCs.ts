"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Npc } from "@/types";

export type NpcInput = Pick<
  Npc,
  | "name"
  | "role"
  | "faction"
  | "location"
  | "public_info"
  | "secret_notes"
  | "is_visible_to_players"
>;

/** Fetch and manage a campaign's NPCs. */
export function useNPCs(campaignId: string | undefined) {
  const [data, setData] = useState<Npc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) {
      setData([]);
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      const { data: rows, error: err } = await supabase
        .from("npcs")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("name", { ascending: true });
      if (!active) return;
      setData((rows as Npc[]) ?? []);
      setError(err?.message ?? null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [campaignId]);

  const create = useCallback(
    async (input: NpcInput) => {
      if (!campaignId) return { error: "Кампанію не вибрано" };
      const { data: row, error: err } = await supabase
        .from("npcs")
        .insert({ campaign_id: campaignId, ...input })
        .select("*")
        .single();
      if (!err && row) {
        setData((d) =>
          [...d, row as Npc].sort((a, b) => a.name.localeCompare(b.name)),
        );
      }
      return { error: err?.message ?? null };
    },
    [campaignId],
  );

  const update = useCallback(async (id: string, patch: Partial<Npc>) => {
    setData((d) => d.map((n) => (n.id === id ? { ...n, ...patch } : n)));
    const { error: err } = await supabase.from("npcs").update(patch).eq("id", id);
    return { error: err?.message ?? null };
  }, []);

  const remove = useCallback(async (id: string) => {
    setData((d) => d.filter((n) => n.id !== id));
    const { error: err } = await supabase.from("npcs").delete().eq("id", id);
    return { error: err?.message ?? null };
  }, []);

  const toggleVisible = useCallback(
    (npc: Npc) => update(npc.id, { is_visible_to_players: !npc.is_visible_to_players }),
    [update],
  );

  return { data, loading, error, create, update, remove, toggleVisible };
}
