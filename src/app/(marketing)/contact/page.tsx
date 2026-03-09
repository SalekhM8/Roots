import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Roots Pharmacy. We're here to help with orders, consultations, and general enquiries.",
};

export default function ContactPage() {
  return (
    <div className="bg-roots-cream">
      <section className="bg-roots-green py-20 text-center text-roots-cream md:py-28">
        <div className="page-container">
          <h1 className="text-[38px] font-medium leading-tight md:text-[56px]">Contact Us</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-roots-cream/80">
            Have a question about your order, consultation, or our products? We&apos;re here to help.
          </p>
        </div>
      </section>

      <section className="page-container py-16 md:py-20">
        <div className="mx-auto max-w-2xl">
          <div className="space-y-8">
            <div>
              <h2 className="mb-2 text-xl font-medium text-roots-green">Email</h2>
              <p className="text-roots-navy/80">
                <a href="mailto:support@rootspharmacy.co.uk" className="underline">
                  support@rootspharmacy.co.uk
                </a>
              </p>
              <p className="mt-1 text-sm text-roots-navy/60">
                We aim to respond within 24 hours on business days.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-medium text-roots-green">Orders & Delivery</h2>
              <p className="text-roots-navy/80">
                For order enquiries, please include your order number (ROOTS-XXXXXXXX-XXXX) in your
                email so we can help you as quickly as possible.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-medium text-roots-green">Consultations</h2>
              <p className="text-roots-navy/80">
                If you have questions about your Mounjaro consultation or need to provide additional
                information, please check your account dashboard first — your prescriber may have
                left a message there.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
