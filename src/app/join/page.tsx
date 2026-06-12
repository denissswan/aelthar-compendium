"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, Castle, ArrowRight } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageBody from "@/components/PageBody";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { writeStorage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/storageKeys";

interface FoundCampaign {
  id: string;
  name: string;
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-center text-lg font-semibold uppercase tracking-[0.3em] text-fg placeholder:tracking-normal placeholder:text-fg-dim focus:border-accent focus:outline-none";

export default function JoinCampaignPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [found, setFound] = useState<FoundCampaign | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    setFound(null);

    const { data, error: rpcError } = await supabase.rpc("redeem_invite_code", {
      p_code: trimmed,
    });
    setBusy(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    const row = Array.isArray(data) ? data[0] : null;
    if (!row) {
      setError("Кампанію з таким кодом не знайдено. Перевірте код у майстра.");
      return;
    }
    setFound({ id: row.id, name: row.name });
  };

  const proceed = () => {
    // Hand only the code to the creation page; it re-validates server-side.
    writeStorage(STORAGE_KEYS.pendingJoinCode, code.trim());
    router.push("/characters/new");
  };

  return (
    <>
      <AppHeader title="Приєднатися" backButton />
      <PageBody className="px-4 pt-4 md:mx-auto md:max-w-md md:px-8 md:py-6">
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 rounded-full bg-accent-dim p-3">
            <KeyRound size={26} className="text-accent" />
          </div>
          <h2 className="text-lg font-bold text-fg">Приєднатися до кампанії</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Введіть код запрошення, який дав вам майстер.
          </p>
        </div>

        <form onSubmit={lookup} className="flex flex-col gap-3">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setFound(null);
              setError(null);
            }}
            placeholder="ABC123"
            maxLength={6}
            autoCapitalize="characters"
            autoComplete="off"
            className={inputClass}
          />

          {!found && (
            <button
              type="submit"
              disabled={busy || !code.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-bg disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              Знайти кампанію
            </button>
          )}
        </form>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        {found && (
          <div className="mt-4 flex flex-col gap-3">
            <Card accentColor="#c8843a">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent-dim p-2">
                  <Castle size={20} className="text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-fg-dim">
                    Знайдено кампанію
                  </p>
                  <p className="truncate text-[15px] font-bold text-fg">
                    {found.name}
                  </p>
                </div>
              </div>
            </Card>
            <button
              type="button"
              onClick={proceed}
              className="flex items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-bg"
            >
              Створити персонажа тут
              <ArrowRight size={16} />
            </button>
            <p className="text-center text-xs text-fg-dim">
              Далі ви створите персонажа, який одразу приєднається до цієї кампанії.
            </p>
          </div>
        )}
      </PageBody>
    </>
  );
}
