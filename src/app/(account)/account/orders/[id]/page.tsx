import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCustomerOrderDetail } from "@/server/queries/account";
import { AccountNav } from "@/components/account/account-nav";
import { StatusPill } from "@/components/ui/status-pill";
import { Section, Field } from "@/components/admin/section";
import { formatDate, formatDateTime, formatPrice, humanizeStatus } from "@/lib/utils";
import { paymentStatusVariant, fulfillmentStatusVariant } from "@/server/queries/admin";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Order Detail",
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const order = await getCustomerOrderDetail(user.id, id);

  if (!order) notFound();

  const shipment = order.shipments[0];
  const payment = order.payments[0];
  const shippingAddress = order.shippingAddressSnapshot as Record<string, string> | null;

  return (
    <div className="page-container py-16 md:py-20">
      <div className="mb-4">
        <Link href="/account/orders" className="text-sm text-roots-green underline">
          &larr; Back to orders
        </Link>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h1 className="text-[32px] font-medium text-roots-green">
          {order.orderNumber}
        </h1>
        <StatusPill variant={paymentStatusVariant(order.paymentStatus)}>
          {humanizeStatus(order.paymentStatus)}
        </StatusPill>
        <StatusPill variant={fulfillmentStatusVariant(order.fulfillmentStatus)}>
          {humanizeStatus(order.fulfillmentStatus)}
        </StatusPill>
      </div>
      <p className="mb-8 text-roots-navy/60">
        Placed {formatDateTime(order.placedAt)}
      </p>

      <AccountNav />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <Section title="Items">
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <Link
                      href={ROUTES.product(item.product.slug)}
                      className="text-sm font-medium text-roots-navy hover:text-roots-green"
                    >
                      {item.productNameSnapshot}
                    </Link>
                    <p className="text-xs text-roots-navy/50">
                      {item.variantNameSnapshot} · SKU: {item.skuSnapshot}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-roots-navy">
                      {item.quantity} &times; {formatPrice(item.unitPriceMinor)}
                    </p>
                    <p className="text-roots-navy/70">{formatPrice(item.lineTotalMinor)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1 border-t border-roots-green/10 pt-4 text-sm">
              <div className="flex justify-between text-roots-navy/70">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotalMinor)}</span>
              </div>
              <div className="flex justify-between text-roots-navy/70">
                <span>Shipping</span>
                <span>{order.shippingMinor === 0 ? "Free" : formatPrice(order.shippingMinor)}</span>
              </div>
              <div className="flex justify-between font-medium text-roots-navy">
                <span>Total</span>
                <span>{formatPrice(order.totalMinor)}</span>
              </div>
            </div>
          </Section>

          {/* Tracking */}
          {shipment && (
            <div className="mt-6">
              <Section title="Shipping">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Tracking" value={shipment.trackingNumber ?? "—"} />
                  <Field label="Status" value={humanizeStatus(shipment.status)} />
                </div>
                {shipment.trackingUrl && (
                  <a
                    href={shipment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-roots-green underline"
                  >
                    Track your parcel
                  </a>
                )}
                {shipment.trackingEvents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {shipment.trackingEvents.map((event) => (
                      <div key={event.id} className="flex gap-3 text-sm">
                        <span className="whitespace-nowrap text-roots-navy/50">
                          {formatDateTime(event.occurredAt)}
                        </span>
                        <span className="text-roots-navy">{event.eventLabel}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {payment && (
            <Section title="Payment">
              <div className="space-y-3">
                <Field label="Status" value={
                  <StatusPill variant={paymentStatusVariant(payment.status)}>
                    {humanizeStatus(payment.status)}
                  </StatusPill>
                } />
                <Field label="Amount" value={formatPrice(payment.amountMinor)} />
                {payment.captureBefore && (
                  <Field label="Auth expires" value={formatDate(payment.captureBefore)} />
                )}
              </div>
            </Section>
          )}

          {shippingAddress && (
            <Section title="Delivery Address">
              <div className="text-sm text-roots-navy">
                <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                <p className="text-roots-navy/70">{shippingAddress.line1}</p>
                {shippingAddress.line2 && <p className="text-roots-navy/70">{shippingAddress.line2}</p>}
                <p className="text-roots-navy/70">{shippingAddress.city}, {shippingAddress.postcode}</p>
              </div>
            </Section>
          )}

          {order.consultation && (
            <Section title="Consultation">
              <Link
                href={`/account/consultations/${order.consultation.id}`}
                className="text-sm font-medium text-roots-green underline"
              >
                View consultation
              </Link>
              <p className="mt-1 text-xs text-roots-navy/50">
                Status: {humanizeStatus(order.consultation.status)}
              </p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
