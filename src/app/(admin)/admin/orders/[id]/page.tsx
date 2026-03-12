import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getOrderDetail,
  paymentStatusVariant,
  fulfillmentStatusVariant,
  getAuditLogForEntity,
} from "@/server/queries/admin";
import { StatusPill } from "@/components/ui/status-pill";
import { Section } from "@/components/admin/section";
import { formatPrice, formatDateTime, humanizeStatus, getDisplayName } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Order Detail",
};

interface AdminOrderDetailProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailProps) {
  const { id } = await params;

  const [order, auditLog] = await Promise.all([
    getOrderDetail(id),
    getAuditLogForEntity("Order", id),
  ]);

  if (!order) notFound();

  const shippingAddr = order.shippingAddressSnapshot as Record<string, string>;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-sm text-roots-green/70 hover:text-roots-green"
        >
          &larr; Back to orders
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <h1 className="text-2xl font-medium text-roots-green">
          {order.orderNumber}
        </h1>
        <StatusPill variant={paymentStatusVariant(order.paymentStatus)}>
          {order.paymentStatus}
        </StatusPill>
        <StatusPill
          variant={fulfillmentStatusVariant(order.fulfillmentStatus)}
        >
          {humanizeStatus(order.fulfillmentStatus)}
        </StatusPill>
        <span className="text-sm capitalize text-roots-navy/50">
          {order.orderType}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <Section title="Items">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-roots-green/10 text-xs text-roots-navy/50">
                  <th className="pb-2 text-left">Product</th>
                  <th className="pb-2 text-left">SKU</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Unit Price</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-roots-green/5 last:border-0"
                  >
                    <td className="py-2 text-roots-navy">
                      {item.productNameSnapshot} — {item.variantNameSnapshot}
                    </td>
                    <td className="py-2 text-roots-navy/60">
                      {item.skuSnapshot}
                    </td>
                    <td className="py-2 text-right text-roots-navy/70">
                      {item.quantity}
                    </td>
                    <td className="py-2 text-right text-roots-navy/70">
                      {formatPrice(item.unitPriceMinor)}
                    </td>
                    <td className="py-2 text-right font-medium text-roots-navy">
                      {formatPrice(item.lineTotalMinor)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-roots-green/10">
                  <td colSpan={4} className="py-2 text-right text-roots-navy/60">
                    Subtotal
                  </td>
                  <td className="py-2 text-right text-roots-navy">
                    {formatPrice(order.subtotalMinor)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="py-1 text-right text-roots-navy/60">
                    Shipping
                  </td>
                  <td className="py-1 text-right text-roots-navy">
                    {order.shippingMinor === 0
                      ? "Free"
                      : formatPrice(order.shippingMinor)}
                  </td>
                </tr>
                <tr className="font-medium">
                  <td colSpan={4} className="py-2 text-right text-roots-navy">
                    Total
                  </td>
                  <td className="py-2 text-right text-roots-green">
                    {formatPrice(order.totalMinor)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Section>

          {/* Payments */}
          <Section title="Payments">
            {order.payments.length === 0 ? (
              <p className="text-sm text-roots-navy/40">No payments</p>
            ) : (
              <div className="space-y-3">
                {order.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center gap-3 text-sm"
                  >
                    <StatusPill variant={paymentStatusVariant(p.status)}>
                      {p.status}
                    </StatusPill>
                    <span className="text-roots-navy">
                      {formatPrice(p.amountMinor)}
                    </span>
                    <span className="text-roots-navy/40">
                      {p.stripePaymentIntentId}
                    </span>
                    {p.captureBefore && (
                      <span className="text-roots-navy/50">
                        Capture before: {formatDateTime(p.captureBefore)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Shipments */}
          {order.shipments.length > 0 && (
            <Section title="Shipments">
              {order.shipments.map((s) => (
                <div key={s.id} className="space-y-2 text-sm">
                  <div className="flex gap-4">
                    <span className="text-roots-navy/60">
                      {s.carrier} · {s.service}
                    </span>
                    <StatusPill
                      variant={
                        s.status === "delivered"
                          ? "success"
                          : s.status === "in_transit"
                            ? "info"
                            : "pending"
                      }
                    >
                      {humanizeStatus(s.status)}
                    </StatusPill>
                  </div>
                  {s.trackingNumber && (
                    <p className="text-roots-navy/70">
                      Tracking: {s.trackingNumber}
                    </p>
                  )}
                </div>
              ))}
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Section title="Customer">
            <p className="text-sm font-medium text-roots-navy">
              {getDisplayName(order.user, order.guestEmail)}
            </p>
            <p className="text-sm text-roots-navy/60">{order.user?.email ?? order.guestEmail ?? "—"}</p>
          </Section>

          {/* Shipping Address */}
          <Section title="Shipping Address">
            <div className="text-sm text-roots-navy/70">
              <p>
                {shippingAddr.firstName} {shippingAddr.lastName}
              </p>
              <p>{shippingAddr.line1}</p>
              {shippingAddr.line2 && <p>{shippingAddr.line2}</p>}
              <p>
                {shippingAddr.city}, {shippingAddr.postcode}
              </p>
            </div>
          </Section>

          {/* Consultation link */}
          {order.consultation && (
            <Section title="Consultation">
              <Link
                href={`/admin/consultations/${order.consultation.id}`}
                className="text-sm font-medium text-roots-green underline"
              >
                View consultation
              </Link>
              <span className="ml-2 text-sm text-roots-navy/50">
                ({order.consultation.status})
              </span>
            </Section>
          )}

          {/* Audit */}
          <Section title="Audit Log">
            {auditLog.length === 0 ? (
              <p className="text-sm text-roots-navy/40">No audit entries</p>
            ) : (
              <div className="space-y-3">
                {auditLog.map((entry) => (
                  <div key={entry.id} className="text-sm">
                    <p className="font-medium text-roots-navy/80">
                      {entry.action}
                    </p>
                    <p className="text-xs text-roots-navy/40">
                      {entry.actorRole ?? "System"} ·{" "}
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
