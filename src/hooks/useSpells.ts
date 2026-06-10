"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Spell } from "@/types";

interface SpellsState {
  data: Spell[];
  loading: boolean;
  error: string | null;
}

/** Fetch all spells from Supabase, ordered by level then name. */
export function useSpells(): SpellsState {
  const [state, setState] = useState<SpellsState>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("spells")
        .select("*")
        .order("level", { ascending: true })
        .order("name", { ascending: true });

      if (!active) return;
      setState({
        data: (data as Spell[]) ?? [],
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
