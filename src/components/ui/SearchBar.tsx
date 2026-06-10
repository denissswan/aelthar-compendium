"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder,
  className = "",
}: SearchBarProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 ${className}`}
    >
      <Search size={18} className="text-fg-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[15px] text-fg placeholder:text-fg-dim focus:outline-none"
      />
    </div>
  );
}
