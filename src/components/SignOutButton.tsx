"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <button
      type="button"
      onClick={() => signOut()}
      aria-label="Вийти"
      className="rounded-md p-1 text-fg-muted active:text-fg"
    >
      <LogOut size={20} />
    </button>
  );
}
