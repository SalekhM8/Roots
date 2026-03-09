import Link from "next/link";

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon, message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-hero)] border border-dashed border-roots-green/15 py-16 text-center">
      <div className="mb-4 text-roots-green/20">{icon}</div>
      <p className="text-roots-navy/50">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-3 text-sm font-medium text-roots-green underline">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
