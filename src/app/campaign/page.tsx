"use client";

import { useState } from "react";
import Link from "next/link";
import { Castle, Users, Plus } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageBody from "@/components/PageBody";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TabBar from "@/components/ui/TabBar";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import SectionLabel from "@/components/ui/SectionLabel";
import SignOutButton from "@/components/SignOutButton";
import PartyOverview from "@/components/dm/PartyOverview";
import SessionsTab from "@/components/dm/SessionsTab";
import NpcsTab from "@/components/dm/NpcsTab";
import PlayerCampaignView from "@/components/player/PlayerCampaignView";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useIsDM } from "@/hooks/useIsDM";
import { useCampaign } from "@/hooks/useCampaign";
import { useSessions } from "@/hooks/useSessions";
import { useNPCs } from "@/hooks/useNPCs";

const TABS = [
  { key: "overview", label: "Огляд" },
  { key: "sessions", label: "Сесії" },
  { key: "npcs", label: "NPC" },
  { key: "quests", label: "Квести" },
];

export default function CampaignPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const { campaign, playerCount, loading } = useCampaign(user?.id);
  const sessions = useSessions(campaign?.id);
  const npcs = useNPCs(campaign?.id);
  const [tab, setTab] = useState("overview");
  const isDM = useIsDM();
  const lastSession = sessions.data.length
    ? sessions.data[sessions.data.length - 1].session_number
    : 0;

  // Wait for auth to resolve before deciding DM vs player view.
  if (userLoading) {
    return (
      <>
        <AppHeader title="Кампанія" rightAction={<SignOutButton />} />
        <PageBody className="px-4 pt-4">
          <LoadingSpinner />
        </PageBody>
      </>
    );
  }

  // Players get the read-only campaign view (via *_public views).
  if (!isDM) {
    return <PlayerCampaignView />;
  }

  if (loading) {
    return (
      <>
        <AppHeader title="Кампанія" subtitle="DM Панель" rightAction={<SignOutButton />} />
        <PageBody className="px-4 pt-4">
          <LoadingSpinner />
        </PageBody>
      </>
    );
  }

  if (!campaign) {
    return (
      <>
        <AppHeader title="Кампанія" subtitle="DM Панель" rightAction={<SignOutButton />} />
        <PageBody className="px-4 pt-4">
          <EmptyState
            icon={Castle}
            title="Кампанію не створено"
            description="Створіть свою першу кампанію, щоб керувати сесіями, NPC та сюжетом."
            action={
              <Link
                href="/campaign/new"
                className="inline-flex items-center gap-2 rounded-lg border border-accent px-4 py-2 text-sm font-semibold uppercase tracking-[0.06em] text-accent active:bg-accent-dim"
              >
                <Plus size={18} />
                Створити кампанію
              </Link>
            }
          />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <AppHeader
        title="Кампанія"
        subtitle="DM Панель"
        rightAction={
          <div className="flex items-center gap-2">
            <Link
              href="/campaign/new"
              aria-label="Нова кампанія"
              className="rounded-md p-1 text-accent active:opacity-70"
            >
              <Plus size={20} />
            </Link>
            <SignOutButton />
          </div>
        }
      />
      <PageBody className="px-4 pt-4">
        {/* Hero */}
        <div
          className="rounded-xl border border-[#c8843a33] p-5"
          style={{
            background: "linear-gradient(135deg, #1a0a0a, #0d0f14)",
          }}
        >
          <p className="text-[10px] uppercase tracking-[0.08em] text-accent">
            Кампанія · DM панель
          </p>
          <h2 className="mt-1 text-[22px] font-bold leading-tight text-fg">
            {campaign.name}
          </h2>
          <p className="mt-1 text-[13px] text-fg-muted">
            {lastSession > 0 ? `Сесія ${lastSession}` : "Ще немає сесій"}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge label={`${playerCount} гравців`} icon={Users} />
            <Badge label="Активна" color="#4fbf8f" />
            {campaign.setting && <Badge label={campaign.setting} />}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4">
          <TabBar tabs={TABS} active={tab} onChange={setTab} />
        </div>

        <div className="mt-4">
          {tab === "overview" && (
            <div className="flex flex-col gap-5">
              <OverviewTab description={campaign.description} />
              {isDM && <PartyOverview campaignId={campaign.id} />}
            </div>
          )}
          {tab === "sessions" && <SessionsTab sessions={sessions} isDM={isDM} />}
          {tab === "npcs" && <NpcsTab npcs={npcs} isDM={isDM} />}
          {tab === "quests" && <QuestsTab />}
        </div>
      </PageBody>
    </>
  );
}

/* --------------------------------- Огляд ---------------------------------- */

function OverviewTab({ description }: { description: string | null }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <SectionLabel className="mb-2">Опис кампанії</SectionLabel>
        <Card>
          <p className="text-sm leading-relaxed text-fg-muted">
            {description || "Опис ще не додано."}
          </p>
        </Card>
      </div>

      <div>
        <SectionLabel className="mb-2">Сюжетні арки</SectionLabel>
        <p className="text-sm text-fg-dim">Сюжетних арок ще немає.</p>
      </div>
    </div>
  );
}

/* --------------------------------- Квести --------------------------------- */

const QUEST_STATUS_COLOR: Record<string, string> = {
  Активний: "#c8843a",
  Завершений: "#4fbf8f",
  Провалений: "#bf4f4f",
};

// Static placeholder quests (no quests table exists yet).
const EXAMPLE_QUESTS = [
  {
    id: "q1",
    name: "Зникнення старости Валдаару",
    status: "Активний",
    giver: "Рада Старійшин",
  },
  {
    id: "q2",
    name: "Тіні під монастирем",
    status: "Активний",
    giver: "Брат Радомир",
  },
  {
    id: "q3",
    name: "Загублений караван",
    status: "Завершений",
    giver: "Купець Драгомир",
  },
];

function QuestsTab() {
  return (
    <div className="flex flex-col gap-2.5">
      {EXAMPLE_QUESTS.map((quest) => (
        <Card key={quest.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-fg">{quest.name}</p>
              <p className="mt-0.5 text-xs text-fg-muted">Від: {quest.giver}</p>
            </div>
            <Badge
              label={quest.status}
              color={QUEST_STATUS_COLOR[quest.status]}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
