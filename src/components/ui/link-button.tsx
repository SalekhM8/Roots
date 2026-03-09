import Link from "next/link";
import { cn } from "@/lib/utils";

type LinkButtonVariant = "primary" | "secondary" | "outline";

interface LinkButtonProps {
  href: string;
  variant?: LinkButtonVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<LinkButtonVariant, string> = {
  primary: "bg-roots-navy text-roots-cream hover:bg-roots-cream hover:text-roots-navy",
  secondary: "bg-roots-green text-roots-cream hover:bg-roots-navy",
  outline: "border border-roots-cream/40 bg-transparent text-roots-cream hover:bg-roots-cream hover:text-roots-green",
};

export function LinkButton({ href, variant = "primary", className, children }: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center font-medium capitalize transition-colors duration-200",
        "h-[var(--btn-height)] rounded-[var(--radius-btn)] px-10",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}
