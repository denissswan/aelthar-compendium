"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Campaign } from "@/types";

interface CampaignState {
  campaign: Campaign | null;
  playerCount: number;
  loading: boolean;
}

/**
 * The active campaign for a user (the most recent one they DM), plus a count of
 * characters in it. Returns null while there's no user or no campaign.
 */
export function useCampaign(userId: string | undefined): CampaignState {
  const [state, setState] = useState<CampaignState>({
    campaign: null,
    playerCount: 0,
    loading: true,
  });

  useEffect(() => {
    if (!userId) {
      setState({ campaign: null, playerCount: 0, loading: false });
      return;
    }

    let active = true;
    (async () => {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("*")
        .eq("dm_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let playerCount = 0;
      if (campaign) {
        const { count } = await supabase
          .from("characters")
          .select("id", { count: "exact", head: true })
          .eq("campaign_id", (campaign as Campaign).id);
        playerCount = count ?? 0;
      }

      if (!active) return;
      setState({
        campaign: (campaign as Campaign) ?? null,
        playerCount,
        loading: false,
      });
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  return state;
}
