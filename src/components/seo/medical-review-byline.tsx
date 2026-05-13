import Link from "next/link";
import type { Clinician } from "@/lib/clinical/credentials";

/**
 * Visible E-E-A-T byline shown above the fold on every Mounjaro-adjacent
 * clinical page. Names the reviewer, their GPhC / GMC number, and a link to
 * the relevant professional register so users can independently verify.
 *
 * Renders the human-readable "Reviewed by Dr X (GPhC 12345) · Last reviewed
 * 13 May 2026" line that competitors like Numan, Oxford and Simple Online
 * Pharmacy use. Pairs with MedicalWebPageJsonLd which encodes the same
 * information in structured data.
 */
interface MedicalReviewBylineProps {
  /** Person who authored / reviewed the content. */
  reviewer: Clinician;
  /** ISO date — typically CLINICAL_CONTENT_LAST_REVIEWED. */
  lastReviewedIso: string;
  /** Optional secondary author (e.g. content writer paired with clinical reviewer). */
  author?: Clinician;
}

function formatLongDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function registerUrl(reviewer: Clinician): string {
  return reviewer.registerType === "GPhC"
    ? "https://www.pharmacyregulation.org/registers/pharmacist"
    : "https://www.gmc-uk.org/registration-and-licensing/the-medical-register";
}

/**
 * Whether a clinician record has real (non-placeholder) details. We never
 * want to render "TODO Superintendent Pharmacist Name" or
 * "GPhC TODO_GPHC_NUMBER" to public — until real credentials are populated
 * the byline degrades gracefully to just the "Last reviewed" date.
 */
function isPopulated(c: Clinician): boolean {
  return !c.name.startsWith("TODO") && !c.registerNumber.startsWith("TODO");
}

export function MedicalReviewByline({
  reviewer,
  lastReviewedIso,
  author,
}: MedicalReviewBylineProps) {
  const reviewerOk = isPopulated(reviewer);
  const authorOk = author ? isPopulated(author) : false;

  return (
    <div className="glass-card mb-6 rounded-[var(--radius-card)] p-4 text-sm text-roots-navy/80">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {authorOk && author && author.slug !== reviewer.slug && (
          <span>
            Written by{" "}
            <Link
              href={`/team/${author.slug}`}
              className="font-medium text-roots-green underline-offset-2 hover:underline"
            >
              {author.name}, {author.qualification}
            </Link>
          </span>
        )}
        {reviewerOk && (
          <span>
            Medically reviewed by{" "}
            <Link
              href={`/team/${reviewer.slug}`}
              className="font-medium text-roots-green underline-offset-2 hover:underline"
            >
              {reviewer.name}, {reviewer.qualification}
            </Link>{" "}
            <a
              href={registerUrl(reviewer)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-roots-navy/60 underline underline-offset-2"
            >
              ({reviewer.registerType} {reviewer.registerNumber})
            </a>
          </span>
        )}
        <span className="text-xs text-roots-navy/60">
          Last reviewed: <time dateTime={lastReviewedIso}>{formatLongDate(lastReviewedIso)}</time>
        </span>
      </div>
    </div>
  );
}
