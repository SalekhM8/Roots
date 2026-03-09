import type { Metadata } from "next";
import Link from "next/link";
import { AccountNav } from "@/components/account/account-nav";

export const metadata: Metadata = {
  title: "My Account",
};

const dashboardCards = [
  {
    title: "Orders",
    description: "View and track your orders",
    href: "/account/orders",
    count: null,
  },
  {
    title: "Consultations",
    description: "View consultation status and history",
    href: "/account/consultations",
    count: null,
  },
  {
    title: "Profile",
    description: "Manage your personal details",
    href: "/account/profile",
    count: null,
  },
  {
    title: "Addresses",
    description: "Manage delivery and billing addresses",
    href: "/account/addresses",
    count: null,
  },
];

export default function AccountDashboardPage() {
  return (
    <div className="page-container py-16 md:py-20">
      <h1 className="mb-2 text-[32px] font-medium text-roots-green md:text-[42px]">
        My Account
      </h1>
      <p className="mb-8 text-roots-navy/60">
        Welcome back. Manage your orders, consultations, and account details.
      </p>

      <AccountNav />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col rounded-[var(--radius-card)] border border-roots-green/10 bg-white p-6 transition-all duration-200 hover:border-roots-green/20 hover:shadow-sm"
          >
            <h2 className="mb-2 text-lg font-medium text-roots-green group-hover:text-roots-navy">
              {card.title}
            </h2>
            <p className="text-sm text-roots-navy/60">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
