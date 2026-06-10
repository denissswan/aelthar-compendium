"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, User, Shield, type LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const items: NavItem[] = [
  { href: "/compendium", label: "Довідник", icon: BookOpen },
  { href: "/characters", label: "Персонажі", icon: User },
  { href: "/campaign", label: "Кампанія", icon: Shield },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-app border-t border-[#1e2130] bg-[rgba(13,15,20,0.97)] pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="flex items-stretch justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="relative flex flex-col items-center gap-1 px-3 py-2"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-1 rounded-lg bg-[#c8843a15]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon
                  size={22}
                  className={`relative ${active ? "text-accent" : "text-[#3a3d4a]"}`}
                />
                <span
                  className={`relative text-[10px] uppercase tracking-[0.06em] ${
                    active ? "text-accent" : "text-[#3a3d4a]"
                  }`}
                >
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
