"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Quest } from "@/types";

export type QuestInput = Pick<
  Quest,
  "title" | "description" | "giver" | "status"
>;

/** Fetch and (for the DM) manage a campaign's quests. */
export function useQuests(campaignId: string | undefined) {
  const [data, setData] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campaignId) {
      setData([]);
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      const { data: rows } = await supabase
        .from("quests")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: true });
      if (!active) return;
      setData((rows as Quest[]) ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [campaignId]);

  const create = useCallback(
    async (input: QuestInput) => {
      if (!campaignId) return { error: "Кампанію не вибрано" };
      const { data: row, error } = await supabase
        .from("quests")
        .insert({ campaign_id: campaignId, ...input })
        .select("*")
        .single();
      if (!error && row) setData((d) => [...d, row as Quest]);
      return { error: error?.message ?? null };
    },
    [campaignId],
  );

  const update = useCallback(async (id: string, patch: Partial<Quest>) => {
    setData((d) => d.map((q) => (q.id === id ? { ...q, ...patch } : q)));
    const { error } = await supabase.from("quests").update(patch).eq("id", id);
    return { error: error?.message ?? null };
  }, []);

  const remove = useCallback(async (id: string) => {
    setData((d) => d.filter((q) => q.id !== id));
    const { error } = await supabase.from("quests").delete().eq("id", id);
    return { error: error?.message ?? null };
  }, []);

  return { data, loading, create, update, remove };
}
