"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import BottomNav from "@/components/BottomNav";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const PUBLIC_ROUTES = ["/login"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) {
      router.replace("/login");
    } else if (user && isPublic) {
      router.replace("/characters");
    }
  }, [user, loading, isPublic, router]);

  // While resolving the session, or during a redirect, show a spinner.
  if (loading || (!user && !isPublic) || (user && isPublic)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Public pages (login) render bare, without the bottom navigation.
  if (isPublic) {
    return <main>{children}</main>;
  }

  return (
    <>
      <main className="pb-24">{children}</main>
      <BottomNav />
    </>
  );
}
