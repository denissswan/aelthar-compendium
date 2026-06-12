"use client";

import { useEffect, useState } from "react";
import { fetchAllRows } from "@/lib/fetchAllRows";
import type { Monster } from "@/types";

interface MonstersState {
  data: Monster[];
  loading: boolean;
  error: string | null;
}

/** Fetch all monsters (bestiary), ordered by name. Paginated past the 1000 cap. */
export function useMonsters(): MonstersState {
  const [state, setState] = useState<MonstersState>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await fetchAllRows<Monster>("monsters", (q) =>
        q.order("name", { ascending: true }),
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
