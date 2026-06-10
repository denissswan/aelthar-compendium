/**
 * SSR-safe localStorage helpers.
 *
 * localStorage is the offline-first primary store; Supabase is the sync target.
 * All reads/writes go through here so JSON handling and the
 * "window is undefined on the server" guard live in one place.
 */

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    // Corrupt JSON or access denied (private mode) — fall back gracefully.
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or access denied — ignore; Supabase remains the backstop.
  }
}

export function removeStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
