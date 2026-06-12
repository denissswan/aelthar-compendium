"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageBody from "@/components/PageBody";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { writeStorage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/storageKeys";

/** Random 6-character invite code (uppercase letters + digits). */
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const { user } = useCurrentUser();

  const [name, setName] = useState("");
  const [setting, setSetting] = useState("Aelthar");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Спершу увійдіть до облікового запису.");
      return;
    }
    setBusy(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("campaigns")
      .insert({
        name: name.trim(),
        setting: setting.trim() || null,
        description: description.trim() || null,
        is_active: isActive,
        dm_id: user.id,
        invite_code: generateInviteCode(),
      })
      .select("id")
      .single();

    if (insertError) {
      setBusy(false);
      setError(insertError.message);
      return;
    }

    // Mark the new campaign as the active one for the offline-first banner.
    if (data?.id) {
      writeStorage(STORAGE_KEYS.activeCampaignId, data.id);
    }
    router.push("/campaign");
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[15px] text-fg placeholder:text-fg-dim focus:border-accent focus:outline-none";

  return (
    <>
      <AppHeader title="Нова кампанія" backButton />
      <PageBody className="px-4 pt-4 md:mx-auto md:max-w-2xl md:px-8 md:py-6">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-[13px] font-semibold text-fg-muted">
              Назва кампанії *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Тіні Валдаару"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-fg-muted">
              Світ / сетинг
            </label>
            <input
              type="text"
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              placeholder="Aelthar"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-semibold text-fg-muted">
              Опис
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Короткий опис кампанії…"
              className={`${inputClass} resize-none`}
            />
          </div>

          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            <span className="text-sm text-fg">Активна кампанія</span>
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-bg disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            Створити кампанію
          </button>
        </form>
      </PageBody>
    </>
  );
}
