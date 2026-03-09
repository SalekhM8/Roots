import { cn } from "@/lib/utils";

interface PaginationDotsProps {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  variant?: "light" | "dark";
}

export function PaginationDots({ count, activeIndex, onSelect, variant = "light" }: PaginationDotsProps) {
  const activeBg = variant === "light" ? "bg-roots-cream" : "bg-roots-green";
  const inactiveBg = variant === "light" ? "bg-roots-cream/40" : "bg-roots-green/20";

  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Go to item ${i + 1}`}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i === activeIndex ? `w-8 ${activeBg}` : `w-2 ${inactiveBg}`
          )}
        />
      ))}
    </div>
  );
}
