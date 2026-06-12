"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Campaign, Session } from "@/types";

interface PlayerCampaignState {
  campaign: Campaign | null;
  sessions: Session[]; // from sessions_public (no dm_notes)
  loading: boolean;
}

/**
 * Read-only campaign data for a player: their campaign (RLS-scoped via the
 * "players can view" policy) plus published sessions read through the
 * protected sessions_public view. NPCs are fetched by NPCSystem itself.
 */
export function usePlayerCampaign(): PlayerCampaignState {
  const [state, setState] = useState<PlayerCampaignState>({
    campaign: null,
    sessions: [],
    loading: true,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: camp } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!active) return;
      if (!camp) {
        setState({ campaign: null, sessions: [], loading: false });
        return;
      }

      const { data: ses } = await supabase
        .from("sessions_public")
        .select("*")
        .eq("campaign_id", camp.id)
        .order("session_number", { ascending: true });

      if (!active) return;
      setState({
        campaign: camp as Campaign,
        sessions: (ses as Session[]) ?? [],
        loading: false,
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  return state;
}
