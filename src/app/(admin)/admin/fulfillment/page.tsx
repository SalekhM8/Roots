import type { Metadata } from "next";
import Link from "next/link";
import {
  getFulfillmentQueue,
  fulfillmentStatusVariant,
} from "@/server/queries/admin";
import { StatusPill } from "@/components/ui/status-pill";
import { AdminPagination } from "@/components/admin/pagination";
import { FulfillmentFilters } from "@/components/admin/fulfillment-filters";
import { FulfillmentActions } from "@/components/admin/fulfillment-actions";
import { BulkLabels } from "@/components/admin/bulk-labels";
import { formatDate, parsePage, humanizeStatus, getDisplayName } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Fulfillment Queue",
};

interface FulfillmentPageProps {
  searchParams: Promise<{ page?: string; status?: string; type?: string }>;
}

export default async function FulfillmentQueuePage({
  searchParams,
}: FulfillmentPageProps) {
  const { page: pageStr, status, type } = await searchParams;
  const page = parsePage(pageStr);
  const filters = { status, type };
  const { orders, total, pageSize } = await getFulfillmentQueue(page, filters);
  const totalPages = Math.ceil(total / pageSize);

  // Build extra params for pagination links
  const extraParams: Record<string, string> = {};
  if (status) extraParams.status = status;
  if (type) extraParams.type = type;

  return (
    <div className="p-6 md:p-10">
      <h1 className="mb-2 text-2xl font-medium text-roots-green">
        Fulfillment
      </h1>
      <p className="mb-6 text-sm text-roots-navy/50">
        {total} order{total !== 1 ? "s" : ""} in fulfillment queue
      </p>

      <FulfillmentFilters />

      <BulkLabels
        eligibleOrders={orders
          .filter((o) => o.fulfillmentStatus === "packed")
          .map((o) => ({ id: o.id, orderNumber: o.orderNumber }))}
      />

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-roots-green/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-roots-green/10 text-xs font-medium uppercase tracking-wider text-roots-navy/50">
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Type</th>
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
                  colSpan={8}
                >
                  No orders match the current filters
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const name = getDisplayName(order.user, order.guestEmail);
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
                    <td className="px-4 py-3 text-roots-navy/70 capitalize">
                      {order.orderType}
                    </td>
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
                      <div className="flex flex-col gap-1">
                        <span>{shipment?.trackingNumber ?? "\u2014"}</span>
                        {/* Print Label disabled until OBA account is set up
                        {shipment?.clickDropOrderId && (
                          <a
                            href={`/api/fulfillment/label?orderId=${order.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-roots-green underline"
                          >
                            Print Label
                          </a>
                        )} */}
                      </div>
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

      <AdminPagination
        basePath="/admin/fulfillment"
        page={page}
        totalPages={totalPages}
        extraParams={Object.keys(extraParams).length > 0 ? extraParams : undefined}
      />
    </div>
  );
}
