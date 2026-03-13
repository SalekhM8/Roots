import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return Policy",
  description:
    "Roots Pharmacy return policy. Medicines and healthcare products cannot be returned unless faulty or incorrect.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="bg-roots-cream">
      <section className="page-container py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-[32px] font-medium text-roots-green md:text-[42px]">
            Return Policy
          </h1>

          <div className="space-y-6 text-base leading-relaxed text-roots-navy/80">
            <h2 className="pt-4 text-xl font-medium text-roots-green">
              Returns
            </h2>
            <ul className="list-disc space-y-3 pl-6">
              <li>
                Medicines and healthcare products cannot be returned once
                dispatched unless faulty or incorrect
              </li>
              <li>
                If your item arrives damaged or incorrect, contact us within{" "}
                <strong className="text-roots-navy">48 hours</strong> of
                delivery
              </li>
              <li>Proof of purchase required</li>
              <li>Refunds processed once the issue is confirmed</li>
            </ul>

            <h2 className="pt-4 text-xl font-medium text-roots-green">
              Exchanges
            </h2>
            <p>
              We accept exchanges for faulty or incorrect items only. Contact us
              within 48 hours of delivery and we will arrange a replacement.
            </p>

            <h2 className="pt-4 text-xl font-medium text-roots-green">
              How to Contact Us
            </h2>
            <p>
              Email{" "}
              <a
                href="mailto:admin@rootspharmacy.co.uk"
                className="font-medium text-roots-green underline underline-offset-2 hover:text-roots-green/80"
              >
                admin@rootspharmacy.co.uk
              </a>{" "}
              with your order number and a description of the issue. For damaged
              items, please include photos.
            </p>

            <p className="pt-4 text-sm text-roots-navy/60">
              For full details on refunds, see our{" "}
              <Link
                href="/refunds"
                className="font-medium text-roots-green underline underline-offset-2 hover:text-roots-green/80"
              >
                Returns & Refunds
              </Link>{" "}
              page.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
