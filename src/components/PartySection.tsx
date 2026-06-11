"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { useParty } from "@/hooks/useParty";
import SectionLabel from "@/components/ui/SectionLabel";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import PartyCard from "@/components/PartyCard";
import DMCharacterControl from "@/components/DMCharacterControl";

export default function PartySection({ campaignId }: { campaignId: string }) {
  const { data, loading, update } = useParty(campaignId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId
    ? (data.find((c) => c.id === selectedId) ?? null)
    : null;

  return (
    <section>
      <SectionLabel className="mb-2">Персонажі гравців</SectionLabel>

      {loading ? (
        <LoadingSpinner />
      ) : data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Немає персонажів"
          description="Гравці ще не створили персонажів у цій кампанії."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {data.map((c) => (
            <PartyCard
              key={c.id}
              character={c}
              onClick={() => setSelectedId(c.id)}
            />
          ))}
        </div>
      )}

      <DMCharacterControl
        character={selected}
        onClose={() => setSelectedId(null)}
        onUpdate={update}
      />
    </section>
  );
}
