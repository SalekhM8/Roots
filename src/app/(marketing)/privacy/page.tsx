import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Roots Pharmacy privacy policy — how we handle your personal and medical data.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-roots-cream">
      <section className="page-container py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-[32px] font-medium text-roots-green md:text-[42px]">Privacy Policy</h1>
          <div className="space-y-6 text-base leading-relaxed text-roots-navy/80">
            <p>
              Roots Pharmacy is committed to protecting your privacy and handling your personal data responsibly. This policy explains how we collect, use, and safeguard your information.
            </p>
            <h2 className="pt-4 text-xl font-medium text-roots-green">What We Collect</h2>
            <p>
              We collect personal information you provide during account creation, consultations, and purchases. This includes your name, email, address, date of birth, medical history (for consultations), and payment information.
            </p>
            <h2 className="pt-4 text-xl font-medium text-roots-green">Medical Data</h2>
            <p>
              Consultation data is treated as special category data under UK GDPR. It is stored securely, accessible only to authorised clinical staff, and never shared with third parties for marketing purposes.
            </p>
            <h2 className="pt-4 text-xl font-medium text-roots-green">How We Use Your Data</h2>
            <p>
              Your data is used to provide our services: processing orders, conducting clinical consultations, communicating about your orders and account, and complying with legal and regulatory obligations.
            </p>
            <h2 className="pt-4 text-xl font-medium text-roots-green">Your Rights</h2>
            <p>
              You have the right to access, correct, or request deletion of your personal data. Contact us at admin@rootspharmacy.co.uk to exercise these rights.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
