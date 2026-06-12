"use client";

import { useEffect, useState } from "react";
import { fetchAllRows } from "@/lib/fetchAllRows";
import type { Spell } from "@/types";

interface SpellsState {
  data: Spell[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetch all spells from Supabase, ordered by level then name. Paginated so the
 * full set comes through even past PostgREST's 1000-row cap (otherwise the
 * highest spell levels get dropped).
 */
export function useSpells(): SpellsState {
  const [state, setState] = useState<SpellsState>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await fetchAllRows<Spell>("spells", (q) =>
        q
          .order("level", { ascending: true })
          .order("name", { ascending: true }),
      );
      if (!active) return;
      setState({ data, loading: false, error });
    })();
    return () => {
      active = false;
    };
  }, []);

  return state;
}
