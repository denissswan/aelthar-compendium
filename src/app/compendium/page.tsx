"use client";

import { BookOpen } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function CompendiumPage() {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-fg">Довідник</h1>
      </header>

      <EmptyState
        icon={BookOpen}
        title="Довідник порожній"
        description="Закляття, бестіарій та правила світу Аелтар зʼявляться тут."
      />
    </div>
  );
}
