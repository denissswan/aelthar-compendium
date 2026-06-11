"use client";

import { useCallback, useRef } from "react";

interface LongPressHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
}

/**
 * Distinguish a tap from a long-press on a single element.
 *
 * `onTap` fires on a short press/release; `onLongPress` fires once the pointer
 * is held past `delay`ms (default 400). A long-press suppresses the following
 * tap. Touch-friendly — used for "tap to use a spell slot, hold to restore".
 */
export function useLongPress(
  onTap: () => void,
  onLongPress: () => void,
  delay = 400,
): LongPressHandlers {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedLong = useRef(false);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Ignore secondary buttons (e.g. right-click) on mouse devices.
      if (e.button !== undefined && e.button !== 0) return;
      firedLong.current = false;
      timer.current = setTimeout(() => {
        firedLong.current = true;
        onLongPress();
      }, delay);
    },
    [onLongPress, delay],
  );

  const onPointerUp = useCallback(() => {
    clear();
    if (!firedLong.current) onTap();
  }, [clear, onTap]);

  const onPointerLeave = useCallback(() => clear(), [clear]);

  return { onPointerDown, onPointerUp, onPointerLeave };
}
