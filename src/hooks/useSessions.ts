"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@/types";

interface SessionsState {
  data: Session[];
  loading: boolean;
  error: string | null;
}

/** Fetch a campaign's sessions, ordered by session number. */
export function useSessions(campaignId: string | undefined): SessionsState {
  const [state, setState] = useState<SessionsState>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!campaignId) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("session_number", { ascending: true });

      if (!active) return;
      setState({
        data: (data as Session[]) ?? [],
        loading: false,
        error: error?.message ?? null,
      });
    })();

    return () => {
      active = false;
    };
  }, [campaignId]);

  return state;
}
