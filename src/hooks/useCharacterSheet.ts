"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Character } from "@/types";
import { proficiencyBonus } from "@/lib/dnd";
import type { SaveStatus } from "@/hooks/useAutoSave";

// Columns we own and write back to Supabase.
const DB_COLUMNS = [
  "name",
  "race",
  "class",
  "subclass",
  "level",
  "hp_current",
  "hp_max",
  "hp_temp",
  "ac",
  "speed",
  "initiative",
  "proficiency_bonus",
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "cha",
  "proficiencies",
  "notes",
  "background",
  "alignment",
  "appearance",
  "backstory",
  "personality_traits",
  "ideals",
  "bonds",
  "flaws",
  "languages",
  "gold",
  "silver",
  "copper",
] as const;

function pickDbColumns(c: Character) {
  const out: Record<string, unknown> = {};
  for (const col of DB_COLUMNS) out[col] = c[col as keyof Character];
  // Keep the stored proficiency bonus consistent with the level.
  out.proficiency_bonus = proficiencyBonus(c.level);
  return out;
}

export function useCharacterSheet(id: string) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const dataRef = useRef<Character | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load.
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: err } = await supabase
        .from("characters")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!active) return;
      if (err || !data) {
        setError(err?.message ?? "Персонажа не знайдено");
        setLoading(false);
        return;
      }
      const normalized = {
        ...data,
        proficiencies: data.proficiencies ?? { saves: [], skills: [] },
      } as Character;
      dataRef.current = normalized;
      setCharacter(normalized);
      setLoading(false);
    })();
    return () => {
      active = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [id]);

  // Merge a patch, then debounce-save the DB columns (500ms).
  const update = useCallback(
    (patch: Partial<Character>) => {
      if (!dataRef.current) return;
      const next = { ...dataRef.current, ...patch };
      dataRef.current = next;
      setCharacter(next);
      setSaveStatus("saving");

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const { error: err } = await supabase
          .from("characters")
          .update(pickDbColumns(next))
          .eq("id", id);
        setSaveStatus(err ? "error" : "saved");
      }, 500);
    },
    [id],
  );

  return { character, loading, error, saveStatus, update };
}
