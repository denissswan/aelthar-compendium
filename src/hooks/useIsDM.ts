"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";

/** The campaign DM's auth user id. */
export const DM_USER_ID = "638c0ce9-136c-4ea5-ac26-a56fc129fc13";

/** True when the signed-in user is the DM. */
export function useIsDM(): boolean {
  const { user } = useCurrentUser();
  return user?.id === DM_USER_ID;
}
