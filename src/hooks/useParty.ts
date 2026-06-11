"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Character } from "@/types";

/** All characters in a campaign (the party), for the DM control panel. */
export function useParty(campaignId: string | undefined) {
  const [data, setData] = useState<Character[]>([]);
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
        .from("characters")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("name", { ascending: true });
      if (!active) return;
      setData((rows as Character[]) ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [campaignId]);

  /** DM edit of a party member (optimistic + Supabase write). */
  const update = useCallback(
    async (id: string, patch: Partial<Character>) => {
      setData((d) => d.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      await supabase.from("characters").update(patch).eq("id", id);
    },
    [],
  );

  return { data, loading, update };
}
