"use client";

import { useState } from "react";
import { Castle, Users, ClipboardList } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageBody from "@/components/PageBody";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TabBar from "@/components/ui/TabBar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import SectionLabel from "@/components/ui/SectionLabel";
import SignOutButton from "@/components/SignOutButton";
import SessionLog from "@/components/campaign/SessionLog";
import NPCSystem from "@/components/campaign/NPCSystem";
import QuestCard from "@/components/QuestCard";
import PartyCard from "@/components/dm/PartyCard";
import PlayerCharacterModal from "@/components/player/PlayerCharacterModal";
import { usePlayerCampaign } from "@/hooks/usePlayerCampaign";
import { useQuests } from "@/hooks/useQuests";
import { usePlayerParty } from "@/hooks/usePlayerParty";

const TABS = [
  { key: "overview", label: "Огляд" },
  { key: "party", label: "Загін" },
  { key: "sessions", label: "Сесії" },
  { key: "npcs", label: "NPC" },
  { key: "quests", label: "Квести" },
];

export default function PlayerCampaignView() {
  const { campaign, sessions, loading } = usePlayerCampaign();
  const quests = useQuests(campaign?.id);
  const party = usePlayerParty(campaign?.id);
  const [tab, setTab] = useState("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (loading) {
    return (
      <>
        <AppHeader title="Кампанія" rightAction={<SignOutButton />} />
        <PageBody className="px-4 pt-4">
          <LoadingSpinner />
        </PageBody>
      </>
    );
  }

  if (!campaign) {
    return (
      <>
        <AppHeader title="Кампанія" rightAction={<SignOutButton />} />
        <PageBody className="px-4 pt-4">
          <EmptyState
            icon={Castle}
            title="Ви ще не в кампанії"
            description="Щойно ваш персонаж приєднається до кампанії, її дані зʼявляться тут."
          />
        </PageBody>
      </>
    );
  }

  const lastSession = sessions.length
    ? sessions[sessions.length - 1].session_number
    : 0;
  const selected = selectedId
    ? (party.data.find((c) => c.id === selectedId) ?? null)
    : null;

  return (
    <>
      <AppHeader title="Кампанія" rightAction={<SignOutButton />} />
      <PageBody className="px-4 pt-4">
        {/* Hero */}
        <div
          className="rounded-xl border border-[#c8843a33] p-5"
          style={{ background: "linear-gradient(135deg, #1a0a0a, #0d0f14)" }}
        >
          <p className="text-[10px] uppercase tracking-[0.08em] text-accent">
            Кампанія
          </p>
          <h2 className="mt-1 text-[22px] font-bold leading-tight text-fg">
            {campaign.name}
          </h2>
          <p className="mt-1 text-[13px] text-fg-muted">
            {lastSession > 0 ? `Сесія ${lastSession}` : "Ще немає сесій"}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge label="Активна" color="#4fbf8f" />
            {campaign.setting && <Badge label={campaign.setting} />}
          </div>
        </div>

        <div className="mt-4">
          <TabBar tabs={TABS} active={tab} onChange={setTab} />
        </div>

        <div className="mt-4">
          {tab === "overview" && (
            <div>
              <SectionLabel className="mb-2">Опис кампанії</SectionLabel>
              <Card>
                <p className="text-sm leading-relaxed text-fg-muted">
                  {campaign.description || "Опис ще не додано."}
                </p>
              </Card>
            </div>
          )}

          {tab === "party" && (
            <div className="flex flex-col gap-2.5">
              {party.loading ? (
                <LoadingSpinner />
              ) : party.data.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Загін порожній"
                  description="Персонажі ваших побратимів зʼявляться тут."
                />
              ) : (
                party.data.map((c) => (
                  <PartyCard
                    key={c.id}
                    character={c}
                    onClick={() => setSelectedId(c.id)}
                  />
                ))
              )}
            </div>
          )}

          {tab === "sessions" && (
            <SessionLog campaignId={campaign.id} isDM={false} />
          )}

          {tab === "npcs" && (
            <NPCSystem campaignId={campaign.id} isDM={false} />
          )}

          {tab === "quests" && (
            <div className="flex flex-col gap-2.5">
              {quests.loading ? (
                <LoadingSpinner />
              ) : quests.data.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="Квестів ще немає"
                  description="Завдання від майстра зʼявляться тут."
                />
              ) : (
                quests.data.map((q) => <QuestCard key={q.id} quest={q} />)
              )}
            </div>
          )}
        </div>
      </PageBody>

      <PlayerCharacterModal
        character={selected}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
