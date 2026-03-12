import type { Metadata } from "next";
import Link from "next/link";
import {
  getOrdersList,
  paymentStatusVariant,
  fulfillmentStatusVariant,
} from "@/server/queries/admin";
import { StatusPill } from "@/components/ui/status-pill";
import { AdminPagination } from "@/components/admin/pagination";
import { OrderSearchInput } from "@/components/admin/order-search-input";
import { formatPrice, formatDate, parsePage, humanizeStatus, getDisplayName } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Orders",
};

interface OrdersPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function AdminOrdersPage({
  searchParams,
}: OrdersPageProps) {
  const { page: pageStr, q } = await searchParams;
  const page = parsePage(pageStr);
  const { orders, total, pageSize } = await getOrdersList(page, q);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 md:p-10">
      <h1 className="mb-2 text-2xl font-medium text-roots-green">Orders</h1>
      <p className="mb-6 text-sm text-roots-navy/50">
        {total} order{total !== 1 ? "s" : ""}{q ? ` matching "${q}"` : ""} · newest first
      </p>

      <OrderSearchInput />

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-roots-green/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-roots-green/10 text-xs font-medium uppercase tracking-wider text-roots-navy/50">
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Fulfillment</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-12 text-center text-roots-navy/30"
                  colSpan={8}
                >
                  {q ? `No orders found for "${q}"` : "No orders yet"}
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const name = getDisplayName(order.user, order.guestEmail);
                return (
                  <tr
                    key={order.id}
                    className="border-b border-roots-green/5 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-roots-navy">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-roots-navy/70">{name}</td>
                    <td className="px-4 py-3 text-roots-navy/70 capitalize">
                      {order.orderType}
                    </td>
                    <td className="px-4 py-3 text-roots-navy/70">
                      {formatPrice(order.totalMinor)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill
                        variant={paymentStatusVariant(order.paymentStatus)}
                      >
                        {order.paymentStatus}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill
                        variant={fulfillmentStatusVariant(
                          order.fulfillmentStatus
                        )}
                      >
                        {humanizeStatus(order.fulfillmentStatus)}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3 text-roots-navy/70">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm font-medium text-roots-green underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        basePath="/admin/orders"
        page={page}
        totalPages={totalPages}
        extraParams={q ? { q } : undefined}
      />
    </div>
  );
}
