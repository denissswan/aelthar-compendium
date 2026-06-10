"use client";

import { BookOpen } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageBody from "@/components/PageBody";
import EmptyState from "@/components/EmptyState";

export default function CompendiumPage() {
  return (
    <>
      <AppHeader title="Довідник" />
      <PageBody className="flex flex-col gap-5 px-4 pt-5">
        <EmptyState
          icon={BookOpen}
          title="Довідник порожній"
          description="Закляття, бестіарій та правила світу Аелтар зʼявляться тут."
        />
      </PageBody>
    </>
  );
}
