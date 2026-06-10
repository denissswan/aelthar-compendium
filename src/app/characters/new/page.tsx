"use client";

import { UserPlus } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageBody from "@/components/PageBody";
import EmptyState from "@/components/EmptyState";

// Scaffold only — the character creation flow is built next.
export default function NewCharacterPage() {
  return (
    <>
      <AppHeader title="Новий персонаж" backButton />
      <PageBody className="px-4 pt-4">
        <EmptyState
          icon={UserPlus}
          title="Створення персонажа в розробці"
          description="Майстер створення персонажа зʼявиться незабаром."
        />
      </PageBody>
    </>
  );
}
