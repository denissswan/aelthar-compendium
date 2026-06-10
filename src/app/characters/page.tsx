"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageBody from "@/components/PageBody";
import EmptyState from "@/components/EmptyState";
import CharacterCard from "@/components/CharacterCard";
import ActiveCampaignBanner from "@/components/ActiveCampaignBanner";
import { useCharacters } from "@/hooks/useCharacters";
import { useActiveCampaign } from "@/hooks/useActiveCampaign";

const MAX_CHARACTERS = 6;

export default function CharactersPage() {
  const { data, loading } = useCharacters();
  const { campaign, sessionCount } = useActiveCampaign();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q === ""
      ? data
      : data.filter((c) => c.name.toLowerCase().includes(q));
  }, [data, search]);

  return (
    <>
      <AppHeader title="Персонажі" />
      <PageBody className="px-4 pt-4">
        {/* Search */}
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <Search size={18} className="text-fg-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук персонажів…"
            className="w-full bg-transparent text-[15px] text-fg placeholder:text-fg-dim focus:outline-none"
          />
        </div>

        {/* Active campaign banner */}
        {campaign && (
          <div className="mb-1">
            <ActiveCampaignBanner
              campaign={campaign}
              sessionCount={sessionCount}
            />
          </div>
        )}

        {/* Section label */}
        <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
          Мої персонажі · {data.length}/{MAX_CHARACTERS}
        </p>

        {/* List */}
        {loading ? (
          <p className="pt-10 text-center text-fg-muted">Завантаження…</p>
        ) : data.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Поки немає персонажів"
            description="Створіть свого першого героя для пригод у світі Аелтар."
          />
        ) : filtered.length === 0 ? (
          <p className="pt-6 text-center text-sm text-fg-muted">
            Нічого не знайдено.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}
