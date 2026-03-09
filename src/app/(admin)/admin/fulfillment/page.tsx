import type { Metadata } from "next";
import Link from "next/link";
import {
  getFulfillmentQueue,
  fulfillmentStatusVariant,
} from "@/server/queries/admin";
import { StatusPill } from "@/components/ui/status-pill";
import { AdminPagination } from "@/components/admin/pagination";
import { FulfillmentActions } from "@/components/admin/fulfillment-actions";
import { formatDate, parsePage, humanizeStatus, getDisplayName } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Fulfillment Queue",
};

interface FulfillmentPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function FulfillmentQueuePage({
  searchParams,
}: FulfillmentPageProps) {
  const { page: pageStr } = await searchParams;
  const page = parsePage(pageStr);
  const { orders, total, pageSize } = await getFulfillmentQueue(page);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 md:p-10">
      <h1 className="mb-2 text-2xl font-medium text-roots-green">
        Fulfillment
      </h1>
      <p className="mb-8 text-sm text-roots-navy/50">
        {total} orders awaiting fulfillment
      </p>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-roots-green/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-roots-green/10 text-xs font-medium uppercase tracking-wider text-roots-navy/50">
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tracking</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-12 text-center text-roots-navy/30"
                  colSpan={7}
                >
                  No orders in fulfillment queue
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const name = getDisplayName(order.user);
                const totalItems = order.items.reduce(
                  (sum, i) => sum + i.quantity,
                  0
                );
                const shipment = order.shipments[0];

                return (
                  <tr
                    key={order.id}
                    className="border-b border-roots-green/5 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-roots-green underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-roots-navy/70">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-roots-navy/70">{name}</td>
                    <td className="px-4 py-3 text-roots-navy/70">
                      {totalItems}
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
                      {shipment?.trackingNumber ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <FulfillmentActions
                        orderId={order.id}
                        status={order.fulfillmentJob?.status ?? order.fulfillmentStatus}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination basePath="/admin/fulfillment" page={page} totalPages={totalPages} />
    </div>
  );
}
