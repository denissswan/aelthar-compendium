"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Users, BookOpen, ScrollText, Drama } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/characters", label: "Heroes", icon: Users },
  { href: "/compendium", label: "Tome", icon: BookOpen },
  { href: "/sessions", label: "Sessions", icon: ScrollText },
  { href: "/npcs", label: "NPCs", icon: Drama },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-app border-t border-border bg-surface/95 backdrop-blur">
      <ul className="flex items-stretch justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="relative flex flex-col items-center gap-0.5 py-2 text-xs"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-copper"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={22}
                  className={active ? "text-copper" : "text-foreground/60"}
                />
                <span className={active ? "text-copper" : "text-foreground/60"}>
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
