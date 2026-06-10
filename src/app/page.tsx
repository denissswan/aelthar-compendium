export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-copper">Aelthar Compendium</h1>
        <p className="mt-1 text-foreground/60">
          Тіні Валдаару · Session 4
        </p>
      </header>

      <section className="rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-semibold text-copper-light">
          Foundation ready
        </h2>
        <p className="mt-2 text-sm text-foreground/80">
          Supabase client, types, design system, and bottom navigation are in
          place. Build features on top of this shell.
        </p>
      </section>
    </div>
  );
}
