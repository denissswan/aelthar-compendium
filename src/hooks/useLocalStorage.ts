"use client";

import { useCallback, useEffect, useState } from "react";
import { readStorage, writeStorage } from "@/lib/storage";

/**
 * Offline-first state backed by localStorage.
 *
 * Reads synchronously after mount (SSR renders the fallback to avoid hydration
 * mismatch), then persists every change. This is the *primary* store; pair it
 * with `useAutoSave` to push changes to Supabase.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue);

  // Hydrate from localStorage once on the client.
  useEffect(() => {
    setValue(readStorage<T>(key, initialValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        writeStorage(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, set];
}
