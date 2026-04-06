import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy — Roots Pharmacy",
  description:
    "Roots Pharmacy refund policy. Full refunds if your consultation is not approved. 14-day return window on unopened supplements.",
};

export default function RefundsPage() {
  return (
    <div className="bg-roots-cream">
      <section className="page-container py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-[32px] font-medium text-roots-green md:text-[42px]">
            Refund Policy
          </h1>
          <p className="mb-10 text-lg text-roots-navy/60">
            We want you to feel confident ordering from Roots Pharmacy. If
            something isn&apos;t right, we&apos;ll make it right.
          </p>

          <div className="space-y-10 text-base leading-relaxed text-roots-navy/80">
            {/* Prescription Medicines */}
            <div>
              <h2 className="mb-3 text-xl font-medium text-roots-green">
                Prescription Medicines (Mounjaro)
              </h2>
              <div className="space-y-3">
                <p>
                  Your card is <strong>authorised but not charged</strong> when
                  you place an order containing prescription items. Payment is
                  only captured after a qualified UK prescriber approves your
                  consultation.
                </p>
                <ul className="list-inside list-disc space-y-2 pl-2">
                  <li>
                    <strong>Consultation not approved</strong> — your payment
                    authorisation is voided automatically. You are never charged.
                  </li>
                  <li>
                    <strong>Order not yet dispatched</strong> — contact us and we
                    will cancel the order and issue a full refund within 5–10
                    business days.
                  </li>
                  <li>
                    <strong>Order already dispatched</strong> — prescription
                    medicines cannot be returned once dispatched. This is a legal
                    requirement under UK pharmaceutical regulations.
                  </li>
                </ul>
              </div>
            </div>

            {/* Supplements & Wellness Products */}
            <div>
              <h2 className="mb-3 text-xl font-medium text-roots-green">
                Supplements & Wellness Products
              </h2>
              <div className="space-y-3">
                <p>
                  We offer a <strong>14-day return window</strong> from the date
                  of delivery on all supplement and wellness products, provided
                  they are:
                </p>
                <ul className="list-inside list-disc space-y-2 pl-2">
                  <li>Unopened and in their original sealed packaging</li>
                  <li>In resaleable condition</li>
                  <li>Returned within 14 days of delivery</li>
                </ul>
                <p>
                  To arrange a return, email us at{" "}
                  <a
                    href="mailto:admin@rootspharmacy.co.uk"
                    className="font-medium text-roots-green underline underline-offset-2"
                  >
                    admin@rootspharmacy.co.uk
                  </a>{" "}
                  with your order number. We will provide a return address and
                  process your refund within 5–10 business days of receiving the
                  returned item.
                </p>
              </div>
            </div>

            {/* Bundles */}
            <div>
              <h2 className="mb-3 text-xl font-medium text-roots-green">
                Bundle Kits
              </h2>
              <p>
                Bundles must be returned complete and unopened. We cannot accept
                partial bundle returns (e.g. returning one item from a kit). The
                same 14-day window applies.
              </p>
            </div>

            {/* Damaged or Incorrect */}
            <div>
              <h2 className="mb-3 text-xl font-medium text-roots-green">
                Damaged or Incorrect Items
              </h2>
              <div className="space-y-3">
                <p>
                  If you receive a damaged, defective, or incorrect item, please
                  contact us within <strong>48 hours</strong> of delivery with:
                </p>
                <ul className="list-inside list-disc space-y-2 pl-2">
                  <li>Your order number</li>
                  <li>A photo of the damaged/incorrect item</li>
                  <li>A brief description of the issue</li>
                </ul>
                <p>
                  We will arrange a replacement or full refund at no extra cost
                  to you. You will not need to return the damaged item.
                </p>
              </div>
            </div>

            {/* How Refunds Work */}
            <div>
              <h2 className="mb-3 text-xl font-medium text-roots-green">
                How Refunds Are Processed
              </h2>
              <div className="space-y-3">
                <p>All refunds are returned to the original payment method:</p>
                <ul className="list-inside list-disc space-y-2 pl-2">
                  <li>
                    <strong>Voided authorisations</strong> (consultation not
                    approved) — the hold is released immediately. It may take
                    your bank 1–3 days to reflect this.
                  </li>
                  <li>
                    <strong>Refunds on captured payments</strong> — processed
                    within 5–10 business days from the date we approve the
                    refund.
                  </li>
                </ul>
                <p>
                  You will receive an email confirmation when your refund has
                  been issued.
                </p>
              </div>
            </div>

            {/* Exceptions */}
            <div>
              <h2 className="mb-3 text-xl font-medium text-roots-green">
                Non-Refundable Items
              </h2>
              <ul className="list-inside list-disc space-y-2 pl-2">
                <li>Prescription medicines once dispatched</li>
                <li>Opened or used supplements</li>
                <li>Items returned after the 14-day window</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="rounded-[var(--radius-card)] border border-roots-green/10 bg-white p-6">
              <h2 className="mb-2 text-lg font-medium text-roots-green">
                Need Help?
              </h2>
              <p className="text-roots-navy/70">
                Email us at{" "}
                <a
                  href="mailto:admin@rootspharmacy.co.uk"
                  className="font-medium text-roots-green underline underline-offset-2"
                >
                  admin@rootspharmacy.co.uk
                </a>{" "}
                with your order number and we&apos;ll get back to you within 24
                hours.
              </p>
            </div>

            <p className="text-sm text-roots-navy/40">
              This policy is in accordance with the Consumer Contracts
              Regulations 2013 and UK pharmaceutical regulations. Last updated
              April 2026.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
