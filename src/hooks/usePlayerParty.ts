"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Character } from "@/types";

/**
 * Party members for a player, read through the protected `characters_party`
 * view (excludes private fields: notes, backstory, gold/silver/copper).
 */
export function usePlayerParty(campaignId: string | undefined) {
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
        .from("characters_party")
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

  return { data, loading };
}
