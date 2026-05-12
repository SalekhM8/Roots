"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ADMIN_NAV } from "@/lib/constants";

/**
 * Mobile drawer navigation for the admin shell. The desktop sidebar is
 * hidden below `lg`, so without this component admin users on phones have
 * no way to move between admin sections.
 */
export function AdminMobileNav() {
  const pathname = usePathname();
  // Track the pathname the drawer was opened on. The drawer is "open" only
  // when that pathname still matches — so route navigation auto-closes it
  // without needing a setState-in-effect (per React's effect guidance).
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn !== null && openedOn === pathname;
  const close = () => setOpenedOn(null);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenedOn(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenedOn(pathname)}
        aria-label="Open admin menu"
        aria-expanded={open}
        aria-controls="admin-mobile-drawer"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-roots-cream/80 hover:bg-roots-cream/10 hover:text-roots-cream"
      >
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
          id="admin-mobile-drawer"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => close()}
            className="absolute inset-0 bg-roots-navy/60"
          />

          {/* Drawer panel */}
          <div className="absolute inset-y-0 left-0 flex h-full w-72 max-w-[85vw] flex-col bg-roots-green p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-lg font-black uppercase tracking-tighter text-roots-cream">
                ROOTS Admin
              </span>
              <button
                type="button"
                onClick={() => close()}
                aria-label="Close admin menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-roots-cream/80 hover:bg-roots-cream/10 hover:text-roots-cream"
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 4l10 10M14 4L4 14" />
                </svg>
              </button>
            </div>

            <nav className="space-y-1" aria-label="Admin navigation">
              {ADMIN_NAV.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href !== "/admin" && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-[var(--radius-btn)] px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                      active
                        ? "bg-roots-cream/15 text-roots-cream"
                        : "text-roots-cream/80 hover:bg-roots-cream/10 hover:text-roots-cream"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-8">
              <Link
                href="/"
                className="text-xs text-roots-cream/40 transition-opacity hover:opacity-80"
              >
                &larr; Back to store
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
