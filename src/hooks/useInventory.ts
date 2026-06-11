"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { InventoryItem } from "@/types";

export type NewItem = Pick<
  InventoryItem,
  "name" | "description" | "quantity" | "category" | "equipped"
>;

export function useInventory(characterId: string) {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: rows } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("character_id", characterId)
        .order("created_at", { ascending: true });
      if (!active) return;
      setData((rows as InventoryItem[]) ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [characterId]);

  const addItem = useCallback(
    async (item: NewItem) => {
      const { data: row, error } = await supabase
        .from("inventory_items")
        .insert({ character_id: characterId, ...item })
        .select("*")
        .single();
      if (!error && row) setData((d) => [...d, row as InventoryItem]);
      return { error: error?.message ?? null };
    },
    [characterId],
  );

  const updateItem = useCallback(
    async (id: string, patch: Partial<InventoryItem>) => {
      setData((d) => d.map((it) => (it.id === id ? { ...it, ...patch } : it)));
      await supabase.from("inventory_items").update(patch).eq("id", id);
    },
    [],
  );

  const deleteItem = useCallback(async (id: string) => {
    setData((d) => d.filter((it) => it.id !== id));
    const { error } = await supabase
      .from("inventory_items")
      .delete()
      .eq("id", id);
    return { error: error?.message ?? null };
  }, []);

  const toggleEquipped = useCallback(
    (item: InventoryItem) => updateItem(item.id, { equipped: !item.equipped }),
    [updateItem],
  );

  return { data, loading, addItem, updateItem, deleteItem, toggleEquipped };
}
