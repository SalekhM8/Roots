import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BreadcrumbJsonLd,
  ClinicianJsonLd,
  MedicalOrganizationJsonLd,
} from "@/components/seo/json-ld";
import {
  CLINICIANS,
  CLINICAL_CONTENT_LAST_REVIEWED,
} from "@/lib/clinical/credentials";

/**
 * Clinician author hub. Used as the destination of every MedicalReviewByline
 * link and as the source of Person schema for Google E-E-A-T. Google requires
 * MedicalWebPage.reviewedBy.url to resolve to a real page that describes the
 * named clinician — without this, the structured data is filtered out of
 * the eligibility pool for YMYL ranking.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(CLINICIANS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const clinician = CLINICIANS[slug];
  if (!clinician) return { title: "Not found" };

  const title = `${clinician.name}, ${clinician.qualification} — ${clinician.role} | Roots Pharmacy`;
  const description = clinician.bio;

  return {
    title,
    description,
    alternates: { canonical: `/team/${clinician.slug}` },
    openGraph: {
      title,
      description,
      url: `/team/${clinician.slug}`,
      type: "profile",
      locale: "en_GB",
      siteName: "Roots Pharmacy",
    },
    robots: { index: true, follow: true },
  };
}

export default async function TeamPage({ params }: PageProps) {
  const { slug } = await params;
  const clinician = CLINICIANS[slug];
  if (!clinician) notFound();

  const registerUrl =
    clinician.registerType === "GPhC"
      ? "https://www.pharmacyregulation.org/registers/pharmacist"
      : "https://www.gmc-uk.org/registration-and-licensing/the-medical-register";

  return (
    <div className="bg-roots-cream">
      <MedicalOrganizationJsonLd />
      <ClinicianJsonLd clinician={clinician} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Team", href: `/team/${clinician.slug}` },
          { name: clinician.name },
        ]}
      />

      <section className="bg-roots-green text-roots-cream">
        <div className="page-container py-20 md:py-28">
          <nav aria-label="Breadcrumb" className="mb-8 text-xs text-roots-cream/70">
            <Link href="/" className="underline-offset-2 hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-roots-cream">Team</span>
            <span className="mx-2">/</span>
            <span className="text-roots-cream">{clinician.name}</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-wider text-roots-cream/70">
            {clinician.role}
          </p>
          <h1 className="font-serif-display mt-3 max-w-3xl text-[42px] leading-tight md:text-[60px]">
            {clinician.name}, {clinician.qualification}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-roots-cream/85">
            {clinician.bio}
          </p>
        </div>
      </section>

      <section className="page-container py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="glass-card-strong rounded-[var(--radius-card)] p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-roots-navy/60">
              Professional registration
            </p>
            <p className="mt-3 text-base text-roots-navy">
              <span className="font-medium">{clinician.registerType}</span>{" "}
              registration number{" "}
              <span className="font-medium">{clinician.registerNumber}</span>
            </p>
            <a
              href={registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium text-roots-green underline underline-offset-2"
            >
              Verify this clinician on the {clinician.registerType} register →
            </a>
          </div>

          <div className="space-y-4 text-base leading-relaxed text-roots-navy/85">
            <h2 className="font-serif-display text-2xl text-roots-navy md:text-3xl">
              Role at Roots Pharmacy
            </h2>
            <p>
              {clinician.name} is {clinician.role.toLowerCase()} at Roots
              Pharmacy and is responsible for reviewing clinical content
              published on this site, including the Mounjaro information hub
              and the clinical guides. {clinician.name} is registered with the{" "}
              {clinician.registerType === "GPhC"
                ? "General Pharmaceutical Council (GPhC)"
                : "General Medical Council (GMC)"}{" "}
              and works under the professional code of conduct of that
              regulator.
            </p>
            <p>
              Every Mounjaro consultation submitted through this site is
              reviewed by a UK-registered prescriber. We do not auto-approve
              consultations.
            </p>
          </div>

          <p className="text-xs text-roots-navy/60">
            Page last reviewed{" "}
            <time dateTime={CLINICAL_CONTENT_LAST_REVIEWED}>
              {new Date(CLINICAL_CONTENT_LAST_REVIEWED).toLocaleDateString(
                "en-GB",
                { day: "numeric", month: "long", year: "numeric" }
              )}
            </time>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
