"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@/types";

export type SessionInput = Pick<
  Session,
  "session_number" | "title" | "date" | "summary" | "dm_notes"
>;

function sortSessions(list: Session[]): Session[] {
  return [...list].sort((a, b) => a.session_number - b.session_number);
}

/** Fetch and manage a campaign's sessions. */
export function useSessions(campaignId: string | undefined) {
  const [data, setData] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) {
      setData([]);
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      const { data: rows, error: err } = await supabase
        .from("sessions")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("session_number", { ascending: true });
      if (!active) return;
      setData((rows as Session[]) ?? []);
      setError(err?.message ?? null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [campaignId]);

  const create = useCallback(
    async (input: SessionInput) => {
      if (!campaignId) return { error: "Кампанію не вибрано" };
      const { data: row, error: err } = await supabase
        .from("sessions")
        .insert({ campaign_id: campaignId, ...input })
        .select("*")
        .single();
      if (!err && row) setData((d) => sortSessions([...d, row as Session]));
      return { error: err?.message ?? null };
    },
    [campaignId],
  );

  const update = useCallback(async (id: string, patch: Partial<Session>) => {
    setData((d) =>
      sortSessions(d.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    );
    const { error: err } = await supabase
      .from("sessions")
      .update(patch)
      .eq("id", id);
    return { error: err?.message ?? null };
  }, []);

  const remove = useCallback(async (id: string) => {
    setData((d) => d.filter((s) => s.id !== id));
    const { error: err } = await supabase.from("sessions").delete().eq("id", id);
    return { error: err?.message ?? null };
  }, []);

  return { data, loading, error, create, update, remove };
}
