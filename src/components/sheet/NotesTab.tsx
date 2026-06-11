"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Character } from "@/types";

type Field =
  | "appearance"
  | "backstory"
  | "personality_traits"
  | "ideals"
  | "bonds"
  | "flaws"
  | "languages"
  | "notes";

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-[15px] leading-relaxed text-fg placeholder:text-fg-dim focus:border-accent focus:outline-none"
    />
  );
}

export default function NotesTab({
  character,
  onChange,
}: {
  character: Character;
  onChange: (patch: Partial<Character>) => void;
}) {
  const [open, setOpen] = useState<string | null>("appearance");
  const set = (field: Field) => (v: string) =>
    onChange({ [field]: v } as Partial<Character>);

  const sections: { key: string; title: string; body: React.ReactNode }[] = [
    {
      key: "appearance",
      title: "Опис персонажа",
      body: (
        <Textarea
          value={character.appearance ?? ""}
          onChange={set("appearance")}
          placeholder="Зовнішність персонажа…"
        />
      ),
    },
    {
      key: "backstory",
      title: "Передісторія",
      body: (
        <Textarea
          value={character.backstory ?? ""}
          onChange={set("backstory")}
          placeholder="Історія персонажа…"
          rows={6}
        />
      ),
    },
    {
      key: "personality",
      title: "Риси характеру",
      body: (
        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1 text-xs text-fg-muted">Риси</p>
            <Textarea
              value={character.personality_traits ?? ""}
              onChange={set("personality_traits")}
              rows={2}
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-fg-muted">Ідеали</p>
            <Textarea
              value={character.ideals ?? ""}
              onChange={set("ideals")}
              rows={2}
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-fg-muted">Звʼязки</p>
            <Textarea
              value={character.bonds ?? ""}
              onChange={set("bonds")}
              rows={2}
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-fg-muted">Вади</p>
            <Textarea
              value={character.flaws ?? ""}
              onChange={set("flaws")}
              rows={2}
            />
          </div>
        </div>
      ),
    },
    {
      key: "languages",
      title: "Мови та вміння",
      body: (
        <Textarea
          value={character.languages ?? ""}
          onChange={set("languages")}
          placeholder="Мови, інструменти, інші володіння…"
        />
      ),
    },
    {
      key: "notes",
      title: "Нотатки гравця",
      body: (
        <Textarea
          value={character.notes ?? ""}
          onChange={set("notes")}
          placeholder="Вільні нотатки…"
          rows={6}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {sections.map((s) => {
        const isOpen = open === s.key;
        return (
          <div
            key={s.key}
            className="overflow-hidden rounded-lg border border-border bg-surface"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : s.key)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-sm font-semibold text-fg">{s.title}</span>
              <ChevronDown
                size={18}
                className={`text-fg-dim transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && <div className="px-3 pb-3">{s.body}</div>}
          </div>
        );
      })}
    </div>
  );
}
