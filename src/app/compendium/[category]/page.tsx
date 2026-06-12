"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Sparkles, Users, Skull, Swords, BookOpen } from "lucide-react";
import type { Spell, Monster } from "@/types";
import { useSpells } from "@/hooks/useSpells";
import { useRaces } from "@/hooks/useRaces";
import { useMonsters } from "@/hooks/useMonsters";
import { useClasses } from "@/hooks/useClasses";
import AppHeader from "@/components/AppHeader";
import PageBody from "@/components/PageBody";
import EmptyState from "@/components/ui/EmptyState";
import SearchBar from "@/components/ui/SearchBar";
import SpellCard from "@/components/SpellCard";
import SpellDetailSheet from "@/components/SpellDetailSheet";
import RaceCard from "@/components/RaceCard";
import MonsterCard from "@/components/MonsterCard";
import MonsterDetailSheet from "@/components/MonsterDetailSheet";
import ClassCard from "@/components/ClassCard";

const CATEGORY_TITLES: Record<string, string> = {
  spells: "Закляття",
  races: "Раси",
  classes: "Класи",
  monsters: "Бестіарій",
};

export default function CompendiumCategoryPage() {
  const params = useParams();
  const category = String(params.category);

  if (category === "spells") return <SpellsView />;
  if (category === "races") return <RacesView />;
  if (category === "classes") return <ClassesView />;
  if (category === "monsters") return <MonstersView />;
  return <UnknownView />;
}

/* ---------------------------------- Spells --------------------------------- */

const LEVELS: (number | null)[] = [null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function SpellsView() {
  const { data, loading, error } = useSpells();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<number | null>(null);
  const [selected, setSelected] = useState<Spell | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter(
      (s) =>
        (level === null || s.level === level) &&
        (q === "" || s.name.toLowerCase().includes(q)),
    );
  }, [data, search, level]);

  return (
    <>
      <AppHeader title={CATEGORY_TITLES.spells} backButton />
      <PageBody className="flex flex-col gap-4 px-4 pt-4 md:px-8 md:py-6">
        {/* Search */}
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Пошук заклять…"
        />

        {/* Level filter */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {LEVELS.map((lvl) => {
            const active = level === lvl;
            return (
              <button
                key={lvl ?? "all"}
                type="button"
                onClick={() => setLevel(lvl)}
                className={`shrink-0 rounded-md border px-3 py-1 text-sm ${
                  active
                    ? "border-accent bg-accent-dim text-accent"
                    : "border-border text-fg-muted"
                }`}
              >
                {lvl === null ? "Усі" : lvl}
              </button>
            );
          })}
        </div>

        {/* List */}
        {loading ? (
          <p className="pt-10 text-center text-fg-muted">Завантаження…</p>
        ) : error ? (
          <EmptyState
            icon={Sparkles}
            title="Не вдалося завантажити"
            description={error}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Нічого не знайдено"
            description="Спробуйте інший пошук або рівень."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((spell) => (
              <SpellCard
                key={spell.id}
                spell={spell}
                onClick={() => setSelected(spell)}
              />
            ))}
          </div>
        )}
      </PageBody>

      <SpellDetailSheet spell={selected} onClose={() => setSelected(null)} />
    </>
  );
}

/* ---------------------------------- Races ---------------------------------- */

function RacesView() {
  const { data, loading } = useRaces();

  return (
    <>
      <AppHeader title={CATEGORY_TITLES.races} backButton />
      <PageBody className="flex flex-col gap-3 px-4 pt-4">
        {loading ? (
          <p className="pt-10 text-center text-fg-muted">Завантаження…</p>
        ) : data.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Рас ще немає"
            description="Раси світу Аелтар зʼявляться тут, щойно їх буде додано."
          />
        ) : (
          data.map((race) => <RaceCard key={race.id} race={race} />)
        )}
      </PageBody>
    </>
  );
}

/* -------------------------------- Monsters --------------------------------- */

function MonstersView() {
  const { data, loading, error } = useMonsters();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Monster | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q === ""
      ? data
      : data.filter((m) => m.name.toLowerCase().includes(q));
  }, [data, search]);

  return (
    <>
      <AppHeader title={CATEGORY_TITLES.monsters} backButton />
      <PageBody className="flex flex-col gap-4 px-4 pt-4 md:px-8 md:py-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Пошук монстрів…" />

        {loading ? (
          <p className="pt-10 text-center text-fg-muted">Завантаження…</p>
        ) : error ? (
          <EmptyState icon={Skull} title="Не вдалося завантажити" description={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Skull}
            title="Нічого не знайдено"
            description="Спробуйте інший пошук, або імпортуйте бестіарій (npm run seed)."
          />
        ) : (
          <div className="flex flex-col gap-2 md:grid md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((m) => (
              <MonsterCard key={m.id} monster={m} onClick={() => setSelected(m)} />
            ))}
          </div>
        )}
      </PageBody>

      <MonsterDetailSheet monster={selected} onClose={() => setSelected(null)} />
    </>
  );
}

/* --------------------------------- Classes --------------------------------- */

function ClassesView() {
  const { data, loading, error } = useClasses();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q === ""
      ? data
      : data.filter((c) => c.name.toLowerCase().includes(q));
  }, [data, search]);

  return (
    <>
      <AppHeader title={CATEGORY_TITLES.classes} backButton />
      <PageBody className="flex flex-col gap-4 px-4 pt-4 md:px-8 md:py-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Пошук класів…" />

        {loading ? (
          <p className="pt-10 text-center text-fg-muted">Завантаження…</p>
        ) : error ? (
          <EmptyState icon={Swords} title="Не вдалося завантажити" description={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Swords}
            title="Класів ще немає"
            description="Імпортуйте класи (npm run seed), щоб вони зʼявилися тут."
          />
        ) : (
          <div className="flex flex-col gap-2.5 md:grid md:grid-cols-2">
            {filtered.map((c) => (
              <ClassCard key={c.id} klass={c} />
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}

/* --------------------------------- Unknown --------------------------------- */

function UnknownView() {
  return (
    <>
      <AppHeader title="Довідник" backButton />
      <PageBody className="px-4 pt-4">
        <EmptyState
          icon={BookOpen}
          title="Категорію не знайдено"
          description="Такого розділу довідника не існує."
        />
      </PageBody>
    </>
  );
}
