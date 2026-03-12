"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { NAV_LINKS, ROUTES } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";
import { UserIcon, CartIcon, MenuIcon, CloseIcon } from "@/components/icons";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { useCartCount } from "@/components/cart/cart-count-provider";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { count: cartCount } = useCartCount();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  function handleSignOut() {
    signOut(() => router.push(ROUTES.home));
  }

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
            <SearchOverlay />

            {/* User icon with auth-aware behavior */}
            <div className="relative" ref={userMenuRef}>
              {isSignedIn ? (
                <>
                  <button
                    type="button"
                    className="text-roots-cream transition-opacity duration-200 hover:opacity-80"
                    aria-label="Account menu"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <UserIcon />
                  </button>

                  {/* User dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-roots-green/10 bg-white py-1 shadow-lg">
                      <Link
                        href={ROUTES.account}
                        className="block px-4 py-2.5 text-sm font-medium text-roots-navy transition-colors duration-150 hover:bg-roots-cream/50"
                      >
                        My Account
                      </Link>
                      <Link
                        href={ROUTES.accountOrders}
                        className="block px-4 py-2.5 text-sm font-medium text-roots-navy transition-colors duration-150 hover:bg-roots-cream/50"
                      >
                        My Orders
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="block w-full px-4 py-2.5 text-left text-sm font-medium text-roots-navy transition-colors duration-150 hover:bg-roots-cream/50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={ROUTES.signIn}
                  className="text-roots-cream transition-opacity duration-200 hover:opacity-80"
                  aria-label="Sign in"
                >
                  <UserIcon />
                </Link>
              )}
            </div>

            <Link
              href={ROUTES.cart}
              className="relative text-roots-cream transition-opacity duration-200 hover:opacity-80"
              aria-label="Cart"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-roots-orange text-[10px] font-bold leading-none text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
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

          {isSignedIn ? (
            <>
              <Link
                href={ROUTES.account}
                className="border-b border-roots-line-soft py-4 text-lg font-medium text-roots-cream transition-opacity duration-200 hover:opacity-80"
              >
                My Account
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="border-b border-roots-line-soft py-4 text-left text-lg font-medium text-roots-cream/70 transition-opacity duration-200 hover:opacity-80"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href={ROUTES.signIn}
              className="mt-4 py-4 text-lg font-medium text-roots-cream/70"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
