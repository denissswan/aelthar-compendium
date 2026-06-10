"use client";

import type { Campaign } from "@/types";

interface ActiveCampaignBannerProps {
  campaign: Campaign;
  sessionCount: number;
}

export default function ActiveCampaignBanner({
  campaign,
  sessionCount,
}: ActiveCampaignBannerProps) {
  return (
    <div className="rounded-[10px] border border-[#c8843a33] bg-[linear-gradient(135deg,#1a1020,#131620)] p-[14px]">
      <p className="text-[10px] uppercase tracking-[0.06em] text-accent">
        Активна кампанія
      </p>
      <p className="mt-1 text-[16px] font-bold text-fg">{campaign.name}</p>
      <p className="mt-0.5 text-xs text-fg-muted">
        {sessionCount > 0 ? `Сесія ${sessionCount}` : "Ще немає сесій"}
      </p>
    </div>
  );
}
