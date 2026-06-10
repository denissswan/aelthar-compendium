"use client";

import { Castle } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageBody from "@/components/PageBody";
import EmptyState from "@/components/EmptyState";

export default function CampaignPage() {
  return (
    <>
      <AppHeader title="Кампанія" />
      <PageBody className="flex flex-col gap-5 px-4 pt-5">
        <EmptyState
          icon={Castle}
          title="Кампанію не вибрано"
          description="Тут зʼявляться сесії, NPC та нотатки вашої кампанії."
        />
      </PageBody>
    </>
  );
}
