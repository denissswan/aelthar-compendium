"use client";

import { useParams } from "next/navigation";
import { UserRound } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageBody from "@/components/PageBody";
import EmptyState from "@/components/ui/EmptyState";

// Scaffold only — the full character sheet is built next.
export default function CharacterDetailPage() {
  const params = useParams();
  const id = String(params.id);

  return (
    <>
      <AppHeader title="Персонаж" backButton />
      <PageBody className="px-4 pt-4">
        <EmptyState
          icon={UserRound}
          title="Сторінка персонажа в розробці"
          description={`Повний аркуш персонажа (${id}) зʼявиться незабаром.`}
        />
      </PageBody>
    </>
  );
}
