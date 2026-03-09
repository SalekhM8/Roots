"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_LINKS, ROUTES } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";
import { SearchIcon, UserIcon, CartIcon, MenuIcon, CloseIcon } from "@/components/icons";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-roots-green" style={{ height: "var(--header-height)" }}>
        <div className="page-container flex h-full items-center justify-between">
          <Logo />

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[15px] font-medium tracking-tight text-roots-cream transition-opacity duration-200 hover:opacity-80"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              className="text-roots-cream transition-opacity duration-200 hover:opacity-80"
              aria-label="Search"
            >
              <SearchIcon />
            </button>

            <Link
              href={ROUTES.account}
              className="text-roots-cream transition-opacity duration-200 hover:opacity-80"
              aria-label="Account"
            >
              <UserIcon />
            </Link>

            <Link
              href={ROUTES.cart}
              className="relative text-roots-cream transition-opacity duration-200 hover:opacity-80"
              aria-label="Cart"
            >
              <CartIcon />
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="text-roots-cream lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-roots-green transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        style={{ top: "var(--header-height)" }}
      >
        <nav className="page-container flex flex-col gap-1 pt-6" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="border-b border-roots-line-soft py-4 text-lg font-medium text-roots-cream transition-opacity duration-200 hover:opacity-80"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={ROUTES.signIn}
            className="mt-4 py-4 text-lg font-medium text-roots-cream/70"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </>
  );
}
