"use client";

import { Users } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageBody from "@/components/PageBody";
import EmptyState from "@/components/EmptyState";

export default function CharactersPage() {
  return (
    <>
      <AppHeader title="Персонажі" />
      <PageBody className="flex flex-col gap-5 px-4 pt-5">
        <EmptyState
          icon={Users}
          title="Поки немає персонажів"
          description="Створіть свого першого героя для пригод у світі Аелтар."
        />
      </PageBody>
    </>
  );
}
