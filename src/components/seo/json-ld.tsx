import { formatPrice } from "@/lib/utils";
import {
  PHARMACY,
  type Clinician,
} from "@/lib/clinical/credentials";

interface JsonLdProps {
  data: Record<string, unknown>;
}

function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SITE_URL = "https://rootspharmacy.co.uk";

// --- Organization (homepage) ---
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Roots Pharmacy",
        url: "https://rootspharmacy.co.uk",
        logo: "https://rootspharmacy.co.uk/assets/theme/roots-logo.svg",
        description:
          "UK-based GPhC registered pharmacy offering clinician-led Mounjaro weight loss programmes and premium wellness supplements.",
        contactPoint: {
          "@type": "ContactPoint",
          email: "admin@rootspharmacy.co.uk",
          contactType: "customer service",
          areaServed: "GB",
          availableLanguage: "English",
        },
        sameAs: [],
      }}
    />
  );
}

// --- Pharmacy / LocalBusiness ---
export function PharmacyJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Pharmacy",
        name: "Roots Pharmacy",
        url: "https://rootspharmacy.co.uk",
        description:
          "GPhC registered online pharmacy offering prescription weight loss treatments and wellness supplements across the UK.",
        currenciesAccepted: "GBP",
        paymentAccepted: "Credit Card, Debit Card",
        priceRange: "£",
        areaServed: {
          "@type": "Country",
          name: "United Kingdom",
        },
        isicV4: "4773",
      }}
    />
  );
}

// --- Product ---
interface ProductJsonLdProps {
  name: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
  priceMinor: number;
  currency?: string;
  inStock: boolean;
  sku?: string;
}

export function ProductJsonLd({
  name,
  description,
  slug,
  imageUrl,
  priceMinor,
  currency = "GBP",
  inStock,
  sku,
}: ProductJsonLdProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        url: `https://rootspharmacy.co.uk/products/${slug}`,
        ...(imageUrl && { image: imageUrl.startsWith("http") ? imageUrl : `https://rootspharmacy.co.uk${imageUrl}` }),
        ...(sku && { sku }),
        brand: {
          "@type": "Brand",
          name: "Roots Pharmacy",
        },
        offers: {
          "@type": "Offer",
          url: `https://rootspharmacy.co.uk/products/${slug}`,
          priceCurrency: currency,
          price: (priceMinor / 100).toFixed(2),
          availability: inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "Roots Pharmacy",
          },
        },
      }}
    />
  );
}

// --- BreadcrumbList ---
interface BreadcrumbItem {
  name: string;
  href?: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          ...(item.href && {
            item: `https://rootspharmacy.co.uk${item.href}`,
          }),
        })),
      }}
    />
  );
}

// --- FAQPage ---
interface FaqItem {
  question: string;
  answer: string;
}

export function FaqJsonLd({ faqs }: { faqs: FaqItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }}
    />
  );
}

// --- Article (blog) ---
interface ArticleJsonLdProps {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  imageUrl?: string;
  authorName?: string;
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  imageUrl,
  authorName = "Roots Pharmacy",
}: ArticleJsonLdProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url: `https://rootspharmacy.co.uk/blog/${slug}`,
        datePublished: publishedAt,
        ...(updatedAt && { dateModified: updatedAt }),
        ...(imageUrl && { image: imageUrl }),
        author: {
          "@type": "Organization",
          name: authorName,
        },
        publisher: {
          "@type": "Organization",
          name: "Roots Pharmacy",
          url: "https://rootspharmacy.co.uk",
        },
      }}
    />
  );
}

// --- MedicalOrganization (richer than Organization for pharmacy) ---
// Combines Organization + Pharmacy + MedicalBusiness traits. Used on the
// Mounjaro hub page and clinical guides where E-E-A-T signals matter most.
export function MedicalOrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": ["MedicalOrganization", "Pharmacy"],
        "@id": `${SITE_URL}#organization`,
        name: PHARMACY.name,
        url: SITE_URL,
        logo: `${SITE_URL}/assets/theme/roots-logo.svg`,
        description:
          "GPhC-registered UK online pharmacy delivering clinician-led weight management consultations and premium wellness supplements nationwide.",
        medicalSpecialty: ["Pharmacy", "Endocrine"],
        currenciesAccepted: "GBP",
        paymentAccepted: "Credit Card, Debit Card",
        priceRange: "£",
        areaServed: { "@type": "Country", name: "United Kingdom" },
        // Licensed dispensing entity — separate legal entity that holds the
        // GPhC pharmacy registration. Disclosed in footer per regulatory req.
        parentOrganization: {
          "@type": "Organization",
          name: PHARMACY.licensedEntity.name,
          identifier: [
            {
              "@type": "PropertyValue",
              propertyID: "Companies House",
              value: PHARMACY.licensedEntity.companyNumber,
            },
            {
              "@type": "PropertyValue",
              propertyID: "GPhC Pharmacy Registration",
              value: PHARMACY.licensedEntity.gphcRegistration,
            },
          ],
        },
        contactPoint: {
          "@type": "ContactPoint",
          email: "admin@rootspharmacy.co.uk",
          contactType: "customer service",
          areaServed: "GB",
          availableLanguage: "English",
        },
      }}
    />
  );
}

// --- Person (clinician) ---
// Used on team/author hub pages and as the value of MedicalWebPage.reviewedBy.
export function ClinicianJsonLd({ clinician }: { clinician: Clinician }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        name: clinician.name,
        url: `${SITE_URL}/team/${clinician.slug}`,
        jobTitle: clinician.role,
        description: clinician.bio,
        hasCredential: {
          "@type": "EducationalOccupationalCredential",
          credentialCategory: clinician.qualification,
        },
        identifier: {
          "@type": "PropertyValue",
          propertyID: `${clinician.registerType} Registration Number`,
          value: clinician.registerNumber,
        },
        worksFor: { "@id": `${SITE_URL}#organization` },
      }}
    />
  );
}

// --- MedicalWebPage ---
// The schema Google uses to identify YMYL medical content + E-E-A-T trust.
// reviewedBy + dateModified are the two most important fields here.
interface MedicalWebPageJsonLdProps {
  url: string;
  name: string;
  description: string;
  datePublished: string;
  dateModified: string;
  reviewer: Clinician;
  /** Conditions discussed on the page (e.g. "Obesity"). */
  about?: string[];
  /** Medical audience this page is written for. */
  medicalAudience?: "Patient" | "Clinician";
  /** Whether this page contains drug-specific info ("Drug") or general health. */
  specialty?: string;
}

export function MedicalWebPageJsonLd({
  url,
  name,
  description,
  datePublished,
  dateModified,
  reviewer,
  about,
  medicalAudience = "Patient",
  specialty,
}: MedicalWebPageJsonLdProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        url: `${SITE_URL}${url}`,
        name,
        description,
        datePublished,
        dateModified,
        inLanguage: "en-GB",
        isPartOf: { "@id": `${SITE_URL}#organization` },
        publisher: { "@id": `${SITE_URL}#organization` },
        author: {
          "@type": "Person",
          name: reviewer.name,
          url: `${SITE_URL}/team/${reviewer.slug}`,
        },
        reviewedBy: {
          "@type": "Person",
          name: reviewer.name,
          url: `${SITE_URL}/team/${reviewer.slug}`,
          jobTitle: reviewer.role,
          identifier: {
            "@type": "PropertyValue",
            propertyID: `${reviewer.registerType} Registration Number`,
            value: reviewer.registerNumber,
          },
        },
        lastReviewed: dateModified,
        medicalAudience: { "@type": "MedicalAudience", audienceType: medicalAudience },
        ...(about && {
          about: about.map((c) => ({ "@type": "MedicalCondition", name: c })),
        }),
        ...(specialty && { specialty }),
      }}
    />
  );
}

// --- Drug (tirzepatide / Mounjaro) ---
// Distinct from Product schema. This is the clinical entity. Almost no UK
// online pharmacy ships this correctly — easy lever for differentiation.
interface DrugJsonLdProps {
  /** Brand name, e.g. "Mounjaro". */
  proprietaryName: string;
  /** INN, e.g. "tirzepatide". */
  nonProprietaryName: string;
  /** ATC classification code, e.g. "A10BX16". */
  atcCode?: string;
  /** Mechanism of action description. */
  mechanismOfAction: string;
  /** What it's used to treat. */
  indication: string;
  /** Pages that describe full prescribing info. */
  url: string;
  /** Manufacturer / marketing authorisation holder. */
  manufacturer?: string;
  /** Available dose strengths. */
  doseSchedule?: Array<{ doseValue: number; doseUnit: string }>;
}

export function DrugJsonLd({
  proprietaryName,
  nonProprietaryName,
  atcCode,
  mechanismOfAction,
  indication,
  url,
  manufacturer = "Eli Lilly and Company",
  doseSchedule,
}: DrugJsonLdProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Drug",
        name: proprietaryName,
        proprietaryName,
        nonProprietaryName,
        ...(atcCode && { code: { "@type": "MedicalCode", code: atcCode, codingSystem: "ATC" } }),
        url: `${SITE_URL}${url}`,
        manufacturer: { "@type": "Organization", name: manufacturer },
        prescriptionStatus: "https://schema.org/PrescriptionOnly",
        mechanismOfAction,
        indication: { "@type": "MedicalIndication", name: indication },
        drugClass: { "@type": "DrugClass", name: "GLP-1/GIP receptor agonist" },
        ...(doseSchedule && {
          doseSchedule: doseSchedule.map((d) => ({
            "@type": "DoseSchedule",
            doseValue: d.doseValue,
            doseUnit: d.doseUnit,
            frequency: "Once weekly",
          })),
        }),
        legalStatus: "PrescriptionOnly",
      }}
    />
  );
}

// --- WebSite (for sitelinks search box) ---
export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Roots Pharmacy",
        url: "https://rootspharmacy.co.uk",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://rootspharmacy.co.uk/collections/vitamins-supplements?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}
