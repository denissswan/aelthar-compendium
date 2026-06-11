"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storageKeys";

interface DeathSaveState {
  successes: boolean[];
  failures: boolean[];
}

const EMPTY: DeathSaveState = {
  successes: [false, false, false],
  failures: [false, false, false],
};

function Pips({
  values,
  color,
  onToggle,
}: {
  values: boolean[];
  color: string;
  onToggle: (i: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {values.map((on, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onToggle(i)}
          aria-label={`${on ? "Зняти" : "Позначити"} ${i + 1}`}
          className="h-6 w-6 rounded-full border-2"
          style={{
            borderColor: color,
            backgroundColor: on ? color : "transparent",
          }}
        />
      ))}
    </div>
  );
}

export default function DeathSaves({ characterId }: { characterId: string }) {
  const [state, setState] = useLocalStorage<DeathSaveState>(
    STORAGE_KEYS.deathSaves(characterId),
    EMPTY,
  );

  const toggle = (kind: "successes" | "failures", i: number) =>
    setState((prev) => {
      const next = { ...prev, [kind]: [...prev[kind]] };
      next[kind][i] = !next[kind][i];
      return next;
    });

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-fg">Рятівні від смерті</span>
        <button
          type="button"
          onClick={() => setState(EMPTY)}
          className="text-xs text-fg-muted active:text-fg"
        >
          Скинути
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-success">Успіхи</span>
        <Pips
          values={state.successes}
          color="#4fbf8f"
          onToggle={(i) => toggle("successes", i)}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm text-danger">Невдачі</span>
        <Pips
          values={state.failures}
          color="#bf4f4f"
          onToggle={(i) => toggle("failures", i)}
        />
      </div>
    </div>
  );
}
