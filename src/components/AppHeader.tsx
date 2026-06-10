"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  /** Show a back chevron on the left that calls router.back(). */
  backButton?: boolean;
  /** Optional element pinned to the right (e.g. an action button). */
  rightAction?: React.ReactNode;
}

export default function AppHeader({
  title,
  subtitle,
  backButton,
  rightAction,
}: AppHeaderProps) {
  const router = useRouter();

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-gradient-to-b from-[#111420] to-bg pt-[env(safe-area-inset-top)]"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3">
        <div className="flex justify-start">
          {backButton && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Назад"
              className="-ml-1 p-1 text-accent"
            >
              <ChevronLeft size={24} />
            </button>
          )}
        </div>

        <div className="flex min-w-0 flex-col items-center text-center">
          <h1 className="truncate text-[17px] font-semibold leading-tight text-fg">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs uppercase tracking-[0.05em] text-accent">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex justify-end">{rightAction}</div>
      </div>
    </header>
  );
}
