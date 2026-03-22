import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delivery Information",
  description: "Roots Pharmacy delivery information — tracked UK shipping via Royal Mail.",
};

export default function DeliveryPage() {
  return (
    <div className="bg-roots-cream">
      <section className="page-container py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-[32px] font-medium text-roots-green md:text-[42px]">Delivery Information</h1>
          <div className="space-y-6 text-base leading-relaxed text-roots-navy/80">
            <h2 className="pt-4 text-xl font-medium text-roots-green">Shipping Costs</h2>
            <p>
              Standard delivery is £3.95 via Royal Mail Tracked 48. <strong>Orders over £20 qualify for free delivery.</strong> You will receive a tracking number and link once your order has been dispatched.
            </p>
            <h2 className="pt-4 text-xl font-medium text-roots-green">Delivery Times</h2>
            <p>
              Orders approved before 2pm on business days are dispatched the same day. Royal Mail Tracked 24 aims for next-day delivery; Tracked 48 within 2-3 working days.
            </p>
            <h2 className="pt-4 text-xl font-medium text-roots-green">Prescription Orders</h2>
            <p>
              Mounjaro and other prescription medicine orders require clinical approval before dispatch. Once approved, your order enters our fulfilment queue immediately.
            </p>
            <h2 className="pt-4 text-xl font-medium text-roots-green">UK Delivery Only</h2>
            <p>
              We currently deliver to mainland UK addresses only. We are unable to ship prescription medicines outside of the United Kingdom.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
