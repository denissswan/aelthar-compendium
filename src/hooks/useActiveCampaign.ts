"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { readStorage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import type { Campaign } from "@/types";

interface ActiveCampaignState {
  campaign: Campaign | null;
  sessionCount: number;
  loading: boolean;
}

/**
 * Resolve the active campaign from the localStorage-stored id, plus its session
 * count (used for the "session N" line). Returns null when none is selected.
 */
export function useActiveCampaign(): ActiveCampaignState {
  const [state, setState] = useState<ActiveCampaignState>({
    campaign: null,
    sessionCount: 0,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    const id = readStorage<string | null>(STORAGE_KEYS.activeCampaignId, null);

    if (!id) {
      setState({ campaign: null, sessionCount: 0, loading: false });
      return;
    }

    (async () => {
      const [{ data: campaign }, { count }] = await Promise.all([
        supabase.from("campaigns").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("sessions")
          .select("id", { count: "exact", head: true })
          .eq("campaign_id", id),
      ]);

      if (!active) return;
      setState({
        campaign: (campaign as Campaign) ?? null,
        sessionCount: count ?? 0,
        loading: false,
      });
    })();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
