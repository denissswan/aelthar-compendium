"use client";

import { Users } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function CharactersPage() {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-fg">Персонажі</h1>
      </header>

      <EmptyState
        icon={Users}
        title="Поки немає персонажів"
        description="Створіть свого першого героя для пригод у світі Аелтар."
      />
    </div>
  );
}
