"use client";

import { useState } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);

    const result =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(email, password);

    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (mode === "signup" && result.needsConfirmation) {
      setInfo("Акаунт створено. Перевірте пошту, щоб підтвердити email.");
    }
    // On success the AuthProvider session updates and AppShell redirects.
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-accent">Aelthar Compendium</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {mode === "signin" ? "Увійдіть до облікового запису" : "Створіть обліковий запис"}
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5">
          <Mail size={18} className="text-fg-muted" />
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-transparent text-[15px] text-fg placeholder:text-fg-dim focus:outline-none"
          />
        </label>

        <label className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5">
          <Lock size={18} className="text-fg-muted" />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full bg-transparent text-[15px] text-fg placeholder:text-fg-dim focus:outline-none"
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}
        {info && <p className="text-sm text-success">{info}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-bg disabled:opacity-60"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {mode === "signin" ? "Увійти" : "Створити акаунт"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setInfo(null);
        }}
        className="mt-5 text-center text-sm text-fg-muted"
      >
        {mode === "signin" ? (
          <>
            Немає акаунта?{" "}
            <span className="font-semibold text-accent">Створити</span>
          </>
        ) : (
          <>
            Вже є акаунт?{" "}
            <span className="font-semibold text-accent">Увійти</span>
          </>
        )}
      </button>
    </div>
  );
}
