"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/layout/Sidebar";
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

  // Mobile: stacked content with the fixed BottomNav (md:hidden).
  // Desktop (md+): a fixed Sidebar on the left and a scrollable main on the
  // right. A single children tree is shared across both — only the chrome
  // (Sidebar vs BottomNav) and main's padding/scroll switch at the breakpoint.
  return (
    <div className="md:flex md:h-screen md:overflow-hidden">
      <Sidebar />
      <main className="pb-24 md:flex-1 md:overflow-y-auto md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
