"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Race } from "@/types";

interface RacesState {
  data: Race[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetch Aelthar races from Supabase.
 * NOTE: the `races` table does not exist yet — until it's created this returns
 * an empty list (the error is swallowed so the UI shows an EmptyState rather
 * than crashing).
 */
export function useRaces(): RacesState {
  const [state, setState] = useState<RacesState>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("races")
        .select("*")
        .order("name", { ascending: true });

      if (!active) return;
      setState({
        data: (data as Race[]) ?? [],
        loading: false,
        error: error?.message ?? null,
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  return state;
}
