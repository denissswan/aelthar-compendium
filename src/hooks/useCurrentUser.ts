"use client";

import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/components/AuthProvider";

/** The currently signed-in Supabase user (null when signed out). */
export function useCurrentUser(): { user: User | null; loading: boolean } {
  const { user, loading } = useAuth();
  return { user, loading };
}
