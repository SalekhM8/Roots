import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardStats } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      label: "Consultations Awaiting Review",
      value: stats.awaitingReview,
      color: "bg-amber-50 text-amber-800",
      href: "/admin/consultations",
    },
    {
      label: "Orders Awaiting Fulfillment",
      value: stats.awaitingFulfillment,
      color: "bg-blue-50 text-blue-800",
      href: "/admin/fulfillment",
    },
    {
      label: "Action Required",
      value: stats.actionRequired,
      color: "bg-red-50 text-red-800",
      href: "/admin/consultations",
    },
    {
      label: "Shipped Today",
      value: stats.shippedToday,
      color: "bg-emerald-50 text-emerald-800",
      href: "/admin/orders",
    },
    {
      label: "Auth Expiring < 24hrs",
      value: stats.authExpiring,
      color: "bg-orange-50 text-orange-800",
      href: "/admin/orders",
    },
  ];

  return (
    <div className="p-6 md:p-10">
      <h1 className="mb-2 text-2xl font-medium text-roots-green">Dashboard</h1>
      <p className="mb-8 text-sm text-roots-navy/50">Overview of operations.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-[var(--radius-card)] p-5 transition-shadow hover:shadow-md ${card.color}`}
          >
            <p className="text-xs font-medium uppercase tracking-wider opacity-70">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
