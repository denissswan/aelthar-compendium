"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CharacterWithCampaign } from "@/types";

interface CharactersState {
  data: CharacterWithCampaign[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetch the signed-in user's characters (with each character's campaign name).
 * Returns an empty list when no user is signed in — RLS also scopes rows to the
 * current user, so this stays empty until auth lands.
 */
export function useCharacters(): CharactersState {
  const [state, setState] = useState<CharactersState>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;
      if (!user) {
        setState({ data: [], loading: false, error: null });
        return;
      }

      const { data, error } = await supabase
        .from("characters")
        .select("*, campaigns(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (!active) return;
      setState({
        data: (data as CharacterWithCampaign[]) ?? [],
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
