"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { readStorage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import type { Campaign, Session } from "@/types";

interface PlayerCampaignState {
  campaign: Campaign | null;
  sessions: Session[]; // from sessions_public (no dm_notes)
  loading: boolean;
}

/**
 * Read-only campaign data for a player, resolved through *their own character's*
 * campaign_id — i.e. the campaign they joined via invite code. If the player
 * belongs to more than one campaign, the locally-active one wins, else the
 * earliest. Sessions come from the protected sessions_public view (no dm_notes);
 * NPCs are fetched by NPCSystem itself.
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setState({ campaign: null, sessions: [], loading: false });
        return;
      }

      // The campaigns this player is a member of = the campaigns their
      // characters belong to.
      const { data: chars } = await supabase
        .from("characters")
        .select("campaign_id")
        .eq("user_id", user.id)
        .not("campaign_id", "is", null)
        .order("created_at", { ascending: true });

      if (!active) return;
      const ids = (chars ?? [])
        .map((c) => c.campaign_id as string | null)
        .filter((id): id is string => !!id);

      if (ids.length === 0) {
        setState({ campaign: null, sessions: [], loading: false });
        return;
      }

      const preferred = readStorage<string | null>(
        STORAGE_KEYS.activeCampaignId,
        null,
      );
      const campId = preferred && ids.includes(preferred) ? preferred : ids[0];

      const [{ data: camp }, { data: ses }] = await Promise.all([
        supabase.from("campaigns").select("*").eq("id", campId).maybeSingle(),
        supabase
          .from("sessions_public")
          .select("*")
          .eq("campaign_id", campId)
          .order("session_number", { ascending: true }),
      ]);

      if (!active) return;
      setState({
        campaign: (camp as Campaign) ?? null,
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
