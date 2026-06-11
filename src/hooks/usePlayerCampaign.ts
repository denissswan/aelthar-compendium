"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Campaign, Session, Npc } from "@/types";

interface PlayerCampaignState {
  campaign: Campaign | null;
  sessions: Session[]; // from sessions_public (no dm_notes)
  npcs: Npc[]; // from npcs_public (no secret_notes, visible only)
  loading: boolean;
}

/**
 * Read-only campaign data for a player: their campaign (RLS-scoped via the
 * "players can view" policy) plus published sessions and visible NPCs read
 * through the protected *_public views.
 */
export function usePlayerCampaign(): PlayerCampaignState {
  const [state, setState] = useState<PlayerCampaignState>({
    campaign: null,
    sessions: [],
    npcs: [],
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
        setState({ campaign: null, sessions: [], npcs: [], loading: false });
        return;
      }

      const [{ data: ses }, { data: np }] = await Promise.all([
        supabase
          .from("sessions_public")
          .select("*")
          .eq("campaign_id", camp.id)
          .order("session_number", { ascending: true }),
        supabase
          .from("npcs_public")
          .select("*")
          .eq("campaign_id", camp.id)
          .order("name", { ascending: true }),
      ]);

      if (!active) return;
      setState({
        campaign: camp as Campaign,
        sessions: (ses as Session[]) ?? [],
        npcs: (np as Npc[]) ?? [],
        loading: false,
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  return state;
}
