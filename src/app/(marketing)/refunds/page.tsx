import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "Roots Pharmacy returns and refunds policy.",
};

export default function RefundsPage() {
  return (
    <div className="bg-roots-cream">
      <section className="page-container py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-[32px] font-medium text-roots-green md:text-[42px]">Returns & Refunds</h1>
          <div className="space-y-6 text-base leading-relaxed text-roots-navy/80">
            <h2 className="pt-4 text-xl font-medium text-roots-green">Prescription Medicines</h2>
            <p>
              Prescription medicines cannot be returned once dispatched by the pharmacy. This is a legal requirement. If your consultation is rejected, your payment authorisation is voided automatically and no charge is made.
            </p>
            <h2 className="pt-4 text-xl font-medium text-roots-green">Supplements</h2>
            <p>
              Supplements may be returned within 14 days of delivery if unopened and in their original packaging. To arrange a return, please contact us at admin@rootspharmacy.co.uk with your order number.
            </p>
            <h2 className="pt-4 text-xl font-medium text-roots-green">Damaged or Incorrect Items</h2>
            <p>
              If you receive a damaged or incorrect item, please contact us within 48 hours of delivery. We will arrange a replacement or full refund.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
