import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ADMIN_NAV, ROUTES } from "@/lib/constants";
import { requireAnyRole } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyRole("admin", "prescriber");
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto bg-roots-green p-6 lg:block">
        <div className="mb-8">
          <Logo subtitle="Admin" />
        </div>

        <nav className="space-y-1" aria-label="Admin navigation">
          {ADMIN_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-[var(--radius-btn)] px-4 py-2.5 text-sm font-medium text-roots-cream/80 transition-colors duration-200 hover:bg-roots-cream/10 hover:text-roots-cream"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-8">
          <Link
            href={ROUTES.home}
            className="text-xs text-roots-cream/40 transition-opacity hover:opacity-80"
          >
            &larr; Back to store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-roots-cream">
        {/* Mobile admin header */}
        <div className="sticky top-0 z-40 flex h-14 items-center justify-between bg-roots-green px-4 lg:hidden">
          <span className="font-display text-lg font-black uppercase tracking-tighter text-roots-cream">
            ROOTS Admin
          </span>
          <Link href="/" className="text-sm text-roots-cream/60">
            Store &rarr;
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
