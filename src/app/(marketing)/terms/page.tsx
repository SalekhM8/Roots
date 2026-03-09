import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Roots Pharmacy terms and conditions of use.",
};

export default function TermsPage() {
  return (
    <div className="bg-roots-cream">
      <section className="page-container py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-[32px] font-medium text-roots-green md:text-[42px]">Terms & Conditions</h1>
          <div className="space-y-6 text-base leading-relaxed text-roots-navy/80">
            <p>
              These terms govern your use of rootspharmacy.co.uk and the services provided by Roots Pharmacy.
            </p>
            <h2 className="pt-4 text-xl font-medium text-roots-green">Prescription Medicines</h2>
            <p>
              Prescription medicines are subject to clinical review by a qualified prescriber. Completing a consultation does not guarantee a prescription will be issued. Prescribing decisions are made solely on clinical grounds.
            </p>
            <h2 className="pt-4 text-xl font-medium text-roots-green">Payments</h2>
            <p>
              For prescription medicine orders, your payment is authorised at checkout but not captured until your consultation is approved. If your consultation is not approved, the authorisation is voided and no charge is made.
            </p>
            <h2 className="pt-4 text-xl font-medium text-roots-green">Returns</h2>
            <p>
              Prescription medicines cannot be returned once dispatched by the pharmacy. Supplements may be returned within 14 days if unopened and in original packaging.
            </p>
            <h2 className="pt-4 text-xl font-medium text-roots-green">Accuracy of Information</h2>
            <p>
              You are responsible for ensuring all information provided in your consultation is accurate and complete. Providing false or misleading information may result in unsafe prescribing and is a breach of these terms.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
