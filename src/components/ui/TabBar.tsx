"use client";

import { motion } from "framer-motion";

export interface Tab {
  key: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

/** Horizontal scrollable tabs with an animated underline indicator. */
export default function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const on = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className="relative shrink-0 px-3 py-2 text-sm"
          >
            <span className={on ? "text-accent" : "text-fg-dim"}>
              {tab.label}
            </span>
            {on && (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
