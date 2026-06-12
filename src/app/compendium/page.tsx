"use client";

import Link from "next/link";
import { Sparkles, Users, Skull, Swords, ChevronRight, type LucideIcon } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageBody from "@/components/PageBody";
import SignOutButton from "@/components/SignOutButton";

interface Category {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const categories: Category[] = [
  {
    href: "/compendium/spells",
    label: "Закляття",
    description: "Усі закляття зі школами, рівнями та описами",
    icon: Sparkles,
  },
  {
    href: "/compendium/races",
    label: "Раси",
    description: "Народи світу Аелтар та їхні стосунки з Церквою",
    icon: Users,
  },
  {
    href: "/compendium/classes",
    label: "Класи",
    description: "Класи персонажів, кубики здоровʼя та володіння",
    icon: Swords,
  },
  {
    href: "/compendium/monsters",
    label: "Бестіарій",
    description: "Монстри й істоти зі стат-блоками та діями",
    icon: Skull,
  },
];

export default function CompendiumPage() {
  return (
    <>
      <AppHeader title="Довідник" rightAction={<SignOutButton />} />
      <PageBody className="flex flex-col gap-3 px-4 pt-4 md:grid md:grid-cols-2 md:gap-3 md:px-8 md:py-6">
        {categories.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors active:bg-surface-2"
          >
            <div className="rounded-lg bg-accent-dim p-2">
              <Icon size={22} className="text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-fg">{label}</p>
              <p className="truncate text-xs text-fg-muted">{description}</p>
            </div>
            <ChevronRight size={20} className="text-fg-dim" />
          </Link>
        ))}
      </PageBody>
    </>
  );
}
