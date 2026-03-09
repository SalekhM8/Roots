import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCustomerOrders } from "@/server/queries/account";
import { AccountNav } from "@/components/account/account-nav";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { CartIcon } from "@/components/icons";
import { ROUTES } from "@/lib/constants";
import { formatDate, formatPrice, parsePage, humanizeStatus } from "@/lib/utils";
import { paymentStatusVariant } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "My Orders",
};

interface OrdersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const user = await requireUser();
  const { page: pageStr } = await searchParams;
  const page = parsePage(pageStr);
  const { orders, total, pageSize } = await getCustomerOrders(user.id, page);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="page-container py-16 md:py-20">
      <h1 className="mb-2 text-[32px] font-medium text-roots-green md:text-[42px]">
        My Orders
      </h1>
      <p className="mb-8 text-roots-navy/60">
        Track and manage your orders.
      </p>

      <AccountNav />

      <div className="mt-8">
        {orders.length === 0 ? (
          <EmptyState
            icon={<CartIcon size={48} />}
            message="No orders yet"
            actionLabel="Browse products"
            actionHref={ROUTES.collection("supplements")}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const shipment = order.shipments[0];
              const payment = order.payments[0];
              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block rounded-[var(--radius-card)] border border-roots-green/10 bg-white p-5 transition-colors hover:border-roots-green/25"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-roots-navy">{order.orderNumber}</p>
                      <p className="text-sm text-roots-navy/50">
                        {formatDate(order.placedAt)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-roots-navy">
                        {formatPrice(order.totalMinor)}
                      </span>
                      {payment && (
                        <StatusPill variant={paymentStatusVariant(payment.status)}>
                          {humanizeStatus(payment.status)}
                        </StatusPill>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-roots-navy/60">
                    {order.items.map((item) => item.productNameSnapshot).join(", ")}
                  </div>
                  {shipment?.trackingNumber && (
                    <p className="mt-1 text-xs text-roots-green">
                      Tracking: {shipment.trackingNumber}
                    </p>
                  )}
                </Link>
              );
            })}

            <AdminPagination basePath="/account/orders" page={page} totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}
