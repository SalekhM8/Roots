export const clerkAppearance = {
  elements: {
    rootBox: "w-full max-w-md",
    card: "rounded-[16px] shadow-none border border-roots-green/10",
    headerTitle: "text-roots-green font-medium",
    headerSubtitle: "text-roots-navy/60",
    formButtonPrimary:
      "bg-roots-navy hover:bg-roots-green text-roots-cream h-[var(--btn-height)] rounded-[var(--radius-btn)]",
    formFieldInput:
      "rounded-[var(--radius-input)] border-roots-green/20 focus:border-roots-green",
    footerActionLink: "text-roots-green hover:text-roots-navy",
  },
} as const;
