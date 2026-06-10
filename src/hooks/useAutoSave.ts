"use client";

import { useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions {
  /** Debounce window before saving. Defaults to 500ms (see CLAUDE.md). */
  delay?: number;
  /** Skip the save that would otherwise fire for the initial value. */
  skipInitial?: boolean;
}

/**
 * Debounced auto-save to Supabase.
 *
 * Watches `value`; after `delay`ms of no further changes it calls `save`.
 * localStorage stays the source of truth (write it eagerly via useLocalStorage);
 * this only handles the remote sync, surfacing a status for UI indicators.
 */
export function useAutoSave<T>(
  value: T,
  save: (value: T) => Promise<void>,
  { delay = 500, skipInitial = true }: UseAutoSaveOptions = {},
): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const firstRun = useRef(skipInitial);
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    setStatus("saving");
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        await saveRef.current(value);
        if (!cancelled) setStatus("saved");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, delay]);

  return status;
}
