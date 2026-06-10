"use client";

import { Castle } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageBody from "@/components/PageBody";
import EmptyState from "@/components/ui/EmptyState";

// Scaffold only — the campaign creation flow is built next.
export default function NewCampaignPage() {
  return (
    <>
      <AppHeader title="Нова кампанія" backButton />
      <PageBody className="px-4 pt-4">
        <EmptyState
          icon={Castle}
          title="Створення кампанії в розробці"
          description="Майстер створення кампанії зʼявиться незабаром."
        />
      </PageBody>
    </>
  );
}
