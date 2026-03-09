import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  subtitle?: string;
  className?: string;
}

export function Logo({ variant = "light", subtitle = "Pharmacy", className }: LogoProps) {
  const textColor = variant === "light" ? "text-roots-cream" : "text-roots-green";
  const subColor = variant === "light" ? "text-roots-cream/80" : "text-roots-green/60";

  return (
    <Link href="/" className={cn("flex flex-col items-start", className)} aria-label="Roots Pharmacy home">
      <span className={cn("font-display text-2xl font-black uppercase leading-none tracking-tighter", textColor)}>
        ROOTS
      </span>
      <span className={cn("text-[9px] font-bold uppercase tracking-[0.3em]", subColor)}>
        {subtitle}
      </span>
    </Link>
  );
}
