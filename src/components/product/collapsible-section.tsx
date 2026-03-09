"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlusIcon } from "@/components/icons";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-current/10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-lg font-medium"
        aria-expanded={open}
      >
        {title}
        <PlusIcon className={cn("transition-transform duration-200", open && "rotate-45")} />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-96 pb-6" : "max-h-0"
        )}
      >
        <div className="text-base leading-relaxed opacity-80">{children}</div>
      </div>
    </div>
  );
}
