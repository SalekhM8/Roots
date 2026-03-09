interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-roots-green/10 bg-white p-6">
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-roots-navy/50">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-roots-navy/50">{label}</dt>
      <dd className="mt-0.5 text-sm text-roots-navy">{value ?? "—"}</dd>
    </div>
  );
}
