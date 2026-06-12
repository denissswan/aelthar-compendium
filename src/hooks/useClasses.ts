"use client";

import { useEffect, useState } from "react";
import { fetchAllRows } from "@/lib/fetchAllRows";
import type { CharacterClass } from "@/types";

interface ClassesState {
  data: CharacterClass[];
  loading: boolean;
  error: string | null;
}

/** Fetch all character classes, ordered by name. */
export function useClasses(): ClassesState {
  const [state, setState] = useState<ClassesState>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await fetchAllRows<CharacterClass>("classes", (q) =>
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
