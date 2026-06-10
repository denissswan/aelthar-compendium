import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Optional action element (e.g. an "add" button) rendered below the text. */
  action?: React.ReactNode;
}

/**
 * Shown when a Supabase query returns no rows. No mock data — this is the
 * honest empty view until real content exists.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-accent-dim p-4">
        <Icon size={32} className="text-accent" />
      </div>
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-fg-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
