"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/consultations", label: "Consultations" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/addresses", label: "Addresses" },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  function handleSignOut() {
    signOut(() => router.push(ROUTES.home));
  }

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-roots-green/10 pb-px" aria-label="Account navigation">
      {links.map((link) => {
        const isActive =
          link.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors duration-200",
              isActive
                ? "border-roots-green text-roots-green"
                : "border-transparent text-roots-navy/50 hover:text-roots-navy"
            )}
          >
            {link.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={handleSignOut}
        className="whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-medium text-roots-navy/50 transition-colors duration-200 hover:text-roots-navy"
      >
        Sign Out
      </button>
    </nav>
  );
}
