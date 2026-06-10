"use client";

import { Castle } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function CampaignPage() {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-fg">Кампанія</h1>
      </header>

      <EmptyState
        icon={Castle}
        title="Кампанію не вибрано"
        description="Тут зʼявляться сесії, NPC та нотатки вашої кампанії."
      />
    </div>
  );
}
