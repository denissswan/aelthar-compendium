"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageBody from "@/components/PageBody";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRaces } from "@/hooks/useRaces";
import { readStorage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import {
  ABILITIES,
  abilityModifier,
  formatModifier,
  hitDieForClass,
  proficiencyBonus,
  type AbilityKey,
} from "@/lib/dnd";
import type { Campaign } from "@/types";

// Standard 5e classes (Ukrainian). Names are chosen so hitDieForClass() in
// lib/dnd resolves the correct hit die for each.
const CLASSES = [
  "Бард",
  "Варвар",
  "Воїн",
  "Друїд",
  "Жрець",
  "Маг",
  "Монах",
  "Паладин",
  "Плут",
  "Слідопит",
  "Чаклун",
  "Чародій",
];

type Abilities = Record<AbilityKey, number>;

const DEFAULT_ABILITIES: Abilities = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
};

/** Standard 5e starting HP: max hit die at L1 + con mod, average per level after. */
function suggestHp(className: string, conScore: number, level: number): number {
  const die = hitDieForClass(className);
  const conMod = abilityModifier(conScore);
  const avgPerLevel = Math.floor(die / 2) + 1;
  const hp = die + conMod + (level - 1) * (avgPerLevel + conMod);
  return Math.max(1, hp);
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[15px] text-fg placeholder:text-fg-dim focus:border-accent focus:outline-none";
const labelClass = "mb-1 block text-[13px] font-semibold text-fg-muted";

export default function NewCharacterPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { data: races } = useRaces();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignId, setCampaignId] = useState<string>("");

  const [name, setName] = useState("");
  const [race, setRace] = useState("");
  const [klass, setKlass] = useState(CLASSES[0]);
  const [subclass, setSubclass] = useState("");
  const [level, setLevel] = useState(1);
  const [abilities, setAbilities] = useState<Abilities>(DEFAULT_ABILITIES);
  const [hpMax, setHpMax] = useState(suggestHp(CLASSES[0], 10, 1));
  const [ac, setAc] = useState(10);
  const [speed, setSpeed] = useState(30);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Whether the user has manually edited HP — until then we keep it in sync
  // with the class/con/level suggestion.
  const hpTouched = useRef(false);

  // Load the user's campaigns; default the selector to the active campaign.
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .eq("dm_id", user.id)
        .order("created_at", { ascending: false });
      if (!active) return;
      const list = (data as Campaign[]) ?? [];
      setCampaigns(list);
      const activeId = readStorage<string | null>(
        STORAGE_KEYS.activeCampaignId,
        null,
      );
      if (activeId && list.some((c) => c.id === activeId)) {
        setCampaignId(activeId);
      } else if (list.length > 0) {
        setCampaignId(list[0].id);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  // Keep the suggested HP in sync until the user overrides it.
  useEffect(() => {
    if (!hpTouched.current) {
      setHpMax(suggestHp(klass, abilities.con, level));
    }
  }, [klass, abilities.con, level]);

  const profBonus = useMemo(() => proficiencyBonus(level), [level]);

  const setAbility = (key: AbilityKey, value: number) =>
    setAbilities((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Спершу увійдіть до облікового запису.");
      return;
    }
    if (!name.trim()) {
      setError("Вкажіть імʼя персонажа.");
      return;
    }
    setBusy(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("characters")
      .insert({
        user_id: user.id,
        campaign_id: campaignId || null,
        name: name.trim(),
        race: race.trim() || "—",
        class: klass,
        subclass: subclass.trim() || null,
        level,
        hp_max: hpMax,
        hp_current: hpMax,
        hp_temp: 0,
        ac,
        speed,
        initiative: abilityModifier(abilities.dex),
        proficiency_bonus: profBonus,
        str: abilities.str,
        dex: abilities.dex,
        con: abilities.con,
        int: abilities.int,
        wis: abilities.wis,
        cha: abilities.cha,
        proficiencies: { saves: [], skills: [] },
        conditions: [],
        gold: 0,
        silver: 0,
        copper: 0,
      })
      .select("id")
      .single();

    if (insertError) {
      setBusy(false);
      setError(insertError.message);
      return;
    }

    router.push(data?.id ? `/characters/${data.id}` : "/characters");
  };

  return (
    <>
      <AppHeader title="Новий персонаж" backButton />
      <PageBody className="px-4 pb-8 pt-4">
        <form onSubmit={submit} className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className={labelClass}>Імʼя *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Імʼя героя"
              className={inputClass}
            />
          </div>

          {/* Campaign */}
          <div>
            <label className={labelClass}>Кампанія</label>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className={inputClass}
            >
              <option value="">Без кампанії</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Race + Class */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Раса</label>
              <input
                type="text"
                list="race-options"
                value={race}
                onChange={(e) => setRace(e.target.value)}
                placeholder="Раса"
                className={inputClass}
              />
              <datalist id="race-options">
                {races.map((r) => (
                  <option key={r.id} value={r.name} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={labelClass}>Клас</label>
              <select
                value={klass}
                onChange={(e) => setKlass(e.target.value)}
                className={inputClass}
              >
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subclass + Level */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div>
              <label className={labelClass}>Архетип</label>
              <input
                type="text"
                value={subclass}
                onChange={(e) => setSubclass(e.target.value)}
                placeholder="Необовʼязково"
                className={inputClass}
              />
            </div>
            <div className="w-24">
              <label className={labelClass}>Рівень</label>
              <input
                type="number"
                min={1}
                max={20}
                value={level}
                onChange={(e) =>
                  setLevel(
                    Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                  )
                }
                className={`${inputClass} text-center`}
              />
            </div>
          </div>

          {/* Ability scores */}
          <div>
            <label className={labelClass}>Характеристики</label>
            <div className="grid grid-cols-3 gap-2">
              {ABILITIES.map((a) => {
                const score = abilities[a.key];
                return (
                  <div
                    key={a.key}
                    className="rounded-lg border border-border bg-surface p-2 text-center"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
                      {a.short}
                    </p>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={score}
                      onChange={(e) =>
                        setAbility(
                          a.key,
                          Math.max(
                            1,
                            Math.min(30, Number(e.target.value) || 1),
                          ),
                        )
                      }
                      className="mt-0.5 w-full bg-transparent text-center text-[18px] font-bold text-fg focus:outline-none"
                    />
                    <p className="text-xs text-accent">
                      {formatModifier(abilityModifier(score))}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-fg-dim">
              Бонус майстерності: {formatModifier(profBonus)}
            </p>
          </div>

          {/* Combat stats */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Здоровʼя</label>
              <input
                type="number"
                min={1}
                value={hpMax}
                onChange={(e) => {
                  hpTouched.current = true;
                  setHpMax(Math.max(1, Number(e.target.value) || 1));
                }}
                className={`${inputClass} text-center`}
              />
            </div>
            <div>
              <label className={labelClass}>КЗ</label>
              <input
                type="number"
                min={1}
                value={ac}
                onChange={(e) => setAc(Math.max(1, Number(e.target.value) || 1))}
                className={`${inputClass} text-center`}
              />
            </div>
            <div>
              <label className={labelClass}>Швидкість</label>
              <input
                type="number"
                min={0}
                value={speed}
                onChange={(e) => setSpeed(Math.max(0, Number(e.target.value) || 0))}
                className={`${inputClass} text-center`}
              />
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-bg disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            Створити персонажа
          </button>
        </form>
      </PageBody>
    </>
  );
}
