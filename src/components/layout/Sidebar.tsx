"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, User, Shield, LogOut, type LucideIcon } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const ITEMS: NavItem[] = [
  { href: "/characters", label: "Персонажі", icon: User },
  { href: "/campaign", label: "Кампанія", icon: Shield },
  { href: "/compendium", label: "Компендіум", icon: BookOpen },
];

/** Desktop-only (md:+) left navigation. Hidden on mobile, where BottomNav takes over. */
export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="hidden border-r border-border bg-surface md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col">
      {/* Logo */}
      <div className="px-5 pb-5 pt-6">
        <p className="text-[26px] font-bold leading-none text-accent">Aelthar</p>
        <p className="mt-1.5 text-[11px] uppercase tracking-[0.2em] text-fg-muted">
          Compendium
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <ul className="flex flex-col gap-1">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg border-l-[3px] py-2.5 pl-3 pr-2 text-[15px] transition-colors ${
                    active
                      ? "border-accent bg-surface-2 text-fg"
                      : "border-transparent text-fg-muted hover:bg-surface-2 hover:text-fg"
                  }`}
                >
                  <Icon size={19} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User + sign out */}
      <div className="border-t border-border px-4 py-4">
        {user?.email && (
          <p className="mb-2 truncate text-xs text-fg-muted" title={user.email}>
            {user.email}
          </p>
        )}
        <button
          type="button"
          onClick={() => signOut()}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <LogOut size={17} />
          Вийти
        </button>
      </div>
    </aside>
  );
}
