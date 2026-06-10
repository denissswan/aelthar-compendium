import type { LucideIcon } from "lucide-react";

interface BadgeProps {
  label: string;
  /** Hex color used for text and a dimmed background. Defaults to accent. */
  color?: string;
  size?: "sm" | "md";
  icon?: LucideIcon;
}

export default function Badge({
  label,
  color = "#c8843a",
  size = "md",
  icon: Icon,
}: BadgeProps) {
  const sizing =
    size === "sm"
      ? "text-[10px] px-1.5 py-0.5 gap-0.5"
      : "text-[11px] px-2 py-0.5 gap-1";
  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold ${sizing}`}
      style={{ color, backgroundColor: `${color}22` }}
    >
      {Icon && <Icon size={size === "sm" ? 10 : 12} />}
      {label}
    </span>
  );
}
