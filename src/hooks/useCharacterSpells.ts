"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CharacterSpellRow } from "@/types";

export function useCharacterSpells(characterId: string) {
  const [data, setData] = useState<CharacterSpellRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: rows } = await supabase
        .from("character_spells")
        .select("*, spells(*)")
        .eq("character_id", characterId);
      if (!active) return;
      const list = ((rows as CharacterSpellRow[]) ?? []).filter(
        (r) => r.spells,
      );
      list.sort(
        (a, b) =>
          a.spells.level - b.spells.level ||
          a.spells.name.localeCompare(b.spells.name),
      );
      setData(list);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [characterId]);

  const togglePrepared = useCallback((row: CharacterSpellRow) => {
    const prepared = !row.prepared;
    setData((d) =>
      d.map((r) => (r.id === row.id ? { ...r, prepared } : r)),
    );
    supabase.from("character_spells").update({ prepared }).eq("id", row.id);
  }, []);

  const addSpell = useCallback(
    async (spellId: string) => {
      const { data: row, error } = await supabase
        .from("character_spells")
        .insert({ character_id: characterId, spell_id: spellId, prepared: false })
        .select("*, spells(*)")
        .single();
      if (!error && row) {
        setData((d) =>
          [...d, row as CharacterSpellRow].sort(
            (a, b) =>
              a.spells.level - b.spells.level ||
              a.spells.name.localeCompare(b.spells.name),
          ),
        );
      }
      return { error: error?.message ?? null };
    },
    [characterId],
  );

  const removeSpell = useCallback(async (id: string) => {
    setData((d) => d.filter((r) => r.id !== id));
    await supabase.from("character_spells").delete().eq("id", id);
  }, []);

  return { data, loading, togglePrepared, addSpell, removeSpell };
}
