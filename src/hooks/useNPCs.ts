"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Npc } from "@/types";

interface NpcsState {
  data: Npc[];
  loading: boolean;
  error: string | null;
}

/** Fetch a campaign's NPCs, with an optimistic visibility toggle (DM action). */
export function useNPCs(campaignId: string | undefined) {
  const [state, setState] = useState<NpcsState>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!campaignId) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("npcs")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("name", { ascending: true });

      if (!active) return;
      setState({
        data: (data as Npc[]) ?? [],
        loading: false,
        error: error?.message ?? null,
      });
    })();

    return () => {
      active = false;
    };
  }, [campaignId]);

  const toggleVisible = useCallback(async (id: string) => {
    let next = false;
    setState((s) => ({
      ...s,
      data: s.data.map((n) => {
        if (n.id !== id) return n;
        next = !n.is_visible_to_players;
        return { ...n, is_visible_to_players: next };
      }),
    }));

    const { error } = await supabase
      .from("npcs")
      .update({ is_visible_to_players: next })
      .eq("id", id);

    if (error) {
      // Revert on failure.
      setState((s) => ({
        ...s,
        data: s.data.map((n) =>
          n.id === id ? { ...n, is_visible_to_players: !next } : n,
        ),
      }));
    }
  }, []);

  return { ...state, toggleVisible };
}
