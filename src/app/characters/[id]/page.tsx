"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { UserRound } from "lucide-react";
import type { AbilityKey } from "@/lib/dnd";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import AppHeader from "@/components/AppHeader";
import PageBody from "@/components/PageBody";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TabBar from "@/components/ui/TabBar";
import SectionLabel from "@/components/ui/SectionLabel";
import SheetHeader from "@/components/sheet/SheetHeader";
import AbilityGrid from "@/components/sheet/AbilityGrid";
import SavingThrows from "@/components/sheet/SavingThrows";
import SkillsList from "@/components/sheet/SkillsList";
import CombatStats from "@/components/sheet/CombatStats";
import DeathSaves from "@/components/sheet/DeathSaves";
import InventoryTab from "@/components/sheet/InventoryTab";
import SpellsTab from "@/components/sheet/SpellsTab";
import NotesTab from "@/components/sheet/NotesTab";

const TABS = [
  { key: "stats", label: "Стати" },
  { key: "inventory", label: "Інвентар" },
  { key: "spells", label: "Заклинання" },
  { key: "notes", label: "Нотатки" },
];

const SAVE_LABEL: Record<string, string> = {
  saving: "Збереження…",
  saved: "Збережено",
  error: "Помилка збереження",
  idle: "",
};

export default function CharacterDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { character, loading, error, saveStatus, update } =
    useCharacterSheet(id);
  const [tab, setTab] = useState("stats");

  if (loading) {
    return (
      <>
        <AppHeader title="Персонаж" backButton />
        <PageBody className="px-4 pt-4">
          <LoadingSpinner />
        </PageBody>
      </>
    );
  }

  if (error || !character) {
    return (
      <>
        <AppHeader title="Персонаж" backButton />
        <PageBody className="px-4 pt-4">
          <EmptyState
            icon={UserRound}
            title="Персонажа не знайдено"
            description={error ?? undefined}
          />
        </PageBody>
      </>
    );
  }

  const prof = character.proficiencies ?? { saves: [], skills: [] };

  const toggleSave = (key: AbilityKey) => {
    const saves = prof.saves.includes(key)
      ? prof.saves.filter((s) => s !== key)
      : [...prof.saves, key];
    update({ proficiencies: { ...prof, saves } });
  };

  const toggleSkill = (key: string) => {
    const skills = prof.skills.includes(key)
      ? prof.skills.filter((s) => s !== key)
      : [...prof.skills, key];
    update({ proficiencies: { ...prof, skills } });
  };

  return (
    <>
      <AppHeader
        title="Персонаж"
        backButton
        rightAction={
          <span className="text-[11px] text-fg-muted">
            {SAVE_LABEL[saveStatus]}
          </span>
        }
      />
      <PageBody className="flex flex-col gap-4 px-4 pt-4 md:px-8 md:py-6">
        <SheetHeader character={character} />

        <TabBar tabs={TABS} active={tab} onChange={setTab} />

        {tab === "stats" && (
          <div className="flex flex-col gap-5">
            <section>
              <SectionLabel className="mb-2">Характеристики</SectionLabel>
              <AbilityGrid character={character} onChange={update} />
            </section>

            {/* On desktop the remaining stat blocks sit in two columns. */}
            <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-5">
              <section>
                <SectionLabel className="mb-2">Рятівні кидки</SectionLabel>
                <SavingThrows character={character} onToggle={toggleSave} />
              </section>

              <section>
                <SectionLabel className="mb-2">Навички</SectionLabel>
                <SkillsList character={character} onToggle={toggleSkill} />
              </section>

              <section>
                <SectionLabel className="mb-2">Бойові показники</SectionLabel>
                <CombatStats character={character} onChange={update} />
              </section>

              <DeathSaves characterId={character.id} />
            </div>
          </div>
        )}

        {tab === "inventory" && (
          <InventoryTab character={character} onChange={update} />
        )}

        {tab === "spells" && <SpellsTab characterId={character.id} />}

        {tab === "notes" && (
          <NotesTab character={character} onChange={update} />
        )}
      </PageBody>
    </>
  );
}
