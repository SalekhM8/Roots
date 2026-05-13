import Link from "next/link";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  MedicalOrganizationJsonLd,
  MedicalWebPageJsonLd,
} from "@/components/seo/json-ld";
import { MedicalReviewByline } from "@/components/seo/medical-review-byline";
import {
  CLINICAL_CONTENT_LAST_REVIEWED,
  MEDICAL_REVIEWER,
  MOUNJARO_HUB_PUBLISHED,
} from "@/lib/clinical/credentials";
import { ROUTES } from "@/lib/constants";

/**
 * Shared chrome for /guides/* pages. Handles hero, byline, breadcrumb +
 * schema stack, and the consistent end-of-article CTA back into the
 * consultation flow. Each guide is responsible only for its own body
 * content + dose-specific FAQ payload.
 */

interface GuideLayoutProps {
  slug: string;
  title: string;
  description: string;
  about?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  children: React.ReactNode;
}

export function GuideLayout({
  slug,
  title,
  description,
  about,
  faqs,
  children,
}: GuideLayoutProps) {
  const url = `/guides/${slug}`;
  return (
    <div className="bg-roots-cream">
      <MedicalOrganizationJsonLd />
      <MedicalWebPageJsonLd
        url={url}
        name={title}
        description={description}
        datePublished={MOUNJARO_HUB_PUBLISHED}
        dateModified={CLINICAL_CONTENT_LAST_REVIEWED}
        reviewer={MEDICAL_REVIEWER}
        about={about}
        specialty="Endocrine"
      />
      {faqs && faqs.length > 0 && <FaqJsonLd faqs={faqs} />}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides" },
          { name: title },
        ]}
      />

      <section className="bg-roots-green text-roots-cream">
        <div className="page-container py-16 md:py-24">
          <nav aria-label="Breadcrumb" className="mb-8 text-xs text-roots-cream/70">
            <Link href="/" className="underline-offset-2 hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/guides" className="underline-offset-2 hover:underline">Guides</Link>
            <span className="mx-2">/</span>
            <span className="text-roots-cream">{title}</span>
          </nav>
          <h1 className="font-serif-display max-w-3xl text-[40px] leading-tight md:text-[56px]">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-roots-cream/85">
            {description}
          </p>
        </div>
      </section>

      <section className="page-container -mt-8">
        <MedicalReviewByline
          reviewer={MEDICAL_REVIEWER}
          lastReviewedIso={CLINICAL_CONTENT_LAST_REVIEWED}
        />
      </section>

      <article className="page-container pb-8 pt-4">
        <div className="prose-roots mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-roots-navy/85">
          {children}
        </div>
      </article>

      <section className="page-container pb-16">
        <div className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-roots-green p-8 text-center text-roots-cream md:p-10">
          <h2 className="font-serif-display text-2xl md:text-3xl">
            Ready to start a Mounjaro consultation?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-roots-cream/85">
            A qualified UK GPhC-registered pharmacist reviews every consultation.
            No charge unless approved.
          </p>
          <Link
            href={ROUTES.consultation}
            className="mt-6 inline-flex h-[52px] items-center justify-center rounded-[var(--radius-btn)] bg-roots-cream px-7 text-sm font-medium text-roots-green transition-opacity hover:opacity-90"
          >
            Start your consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
