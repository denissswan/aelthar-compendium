"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Castle, BookOpen, type LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const items: NavItem[] = [
  { href: "/characters", label: "Персонажі", icon: Users },
  { href: "/campaign", label: "Кампанія", icon: Castle },
  { href: "/compendium", label: "Довідник", icon: BookOpen },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-app border-t border-border bg-surface/95 backdrop-blur">
      <ul className="flex items-stretch justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="relative flex flex-col items-center gap-1 py-2.5 text-xs"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={22}
                  className={active ? "text-accent" : "text-fg-muted"}
                />
                <span className={active ? "text-accent" : "text-fg-muted"}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
