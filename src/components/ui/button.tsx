import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-roots-navy text-roots-cream hover:bg-roots-cream hover:text-roots-navy",
  secondary:
    "bg-roots-green text-roots-cream hover:bg-roots-navy",
  outline:
    "border border-roots-cream/40 bg-transparent text-roots-cream hover:bg-roots-cream hover:text-roots-green",
  ghost:
    "bg-transparent text-roots-green hover:bg-roots-green/5",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-[var(--btn-height)] px-10 text-base",
  sm: "h-10 px-6 text-sm",
  lg: "h-16 px-12 text-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium capitalize transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
          "rounded-[var(--radius-btn)]",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps };
