import { cn } from "@/lib/utils";

export function RadioCard({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-[var(--radius-input)] border px-5 py-4 text-base transition-all duration-200",
        checked
          ? "border-roots-green bg-roots-green/5 text-roots-navy"
          : "border-roots-green/20 bg-white text-roots-navy/70 hover:border-roots-green/40",
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200",
          checked ? "border-roots-green" : "border-roots-green/30",
        )}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-roots-green" />}
      </span>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  id: string;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-base">
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-200",
          checked ? "border-roots-green bg-roots-green" : "border-roots-green/30 bg-white",
        )}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className="text-roots-navy/80">{label}</span>
    </label>
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
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
      maxLength={2000}
      className="mt-3 w-full rounded-[var(--radius-input)] border border-roots-green/20 bg-roots-cream px-5 py-4 text-base text-roots-navy outline-none transition-all duration-200 placeholder:text-roots-navy/40 focus:border-roots-green focus:ring-2 focus:ring-roots-green/20"
    />
  );
}

export function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-hero)] border border-roots-green/10 bg-white p-8 md:p-10">
      {children}
    </div>
  );
}

export function QuestionBlock({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-base font-medium text-roots-navy">{question}</p>
      {children}
    </div>
  );
}

export function UnitToggle({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-[var(--radius-input)] border border-roots-green/20">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors duration-200",
            value === opt.value
              ? "bg-roots-green text-white"
              : "bg-white text-roots-navy/60 hover:bg-roots-green/5",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function YesNoRadio({
  name,
  value,
  onChange,
}: {
  name: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex gap-3">
      <RadioCard name={name} label="Yes" checked={value === true} onChange={() => onChange(true)} />
      <RadioCard name={name} label="No" checked={value === false} onChange={() => onChange(false)} />
    </div>
  );
}
