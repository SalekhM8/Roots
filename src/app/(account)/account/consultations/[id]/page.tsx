import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCustomerConsultationDetail } from "@/server/queries/account";
import { AccountNav } from "@/components/account/account-nav";
import { StatusPill } from "@/components/ui/status-pill";
import { Section, Field } from "@/components/admin/section";
import { formatDate, formatDateTime, formatPrice, humanizeStatus, calculateAge } from "@/lib/utils";
import { consultationStatusVariant } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "Consultation Detail",
};

interface ConsultationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConsultationDetailPage({ params }: ConsultationDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const consultation = await getCustomerConsultationDetail(user.id, id);

  if (!consultation) notFound();

  const answers = consultation.answers;
  const order = consultation.orders[0];
  const prescription = consultation.prescriptions[0];

  return (
    <div className="page-container py-16 md:py-20">
      <div className="mb-4">
        <Link href="/account/consultations" className="text-sm text-roots-green underline">
          &larr; Back to consultations
        </Link>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h1 className="text-[32px] font-medium text-roots-green">
          {consultation.product.name}
        </h1>
        <StatusPill variant={consultationStatusVariant(consultation.status)}>
          {humanizeStatus(consultation.status)}
        </StatusPill>
      </div>
      {consultation.productVariant && (
        <p className="mb-2 text-roots-navy/60">{consultation.productVariant.name}</p>
      )}
      <p className="mb-8 text-sm text-roots-navy/50">
        Started {formatDateTime(consultation.startedAt)}
        {consultation.submittedAt && ` · Submitted ${formatDateTime(consultation.submittedAt)}`}
      </p>

      <AccountNav />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Status Timeline */}
          <Section title="Status Timeline">
            <div className="space-y-3">
              {consultation.reviews.map((review) => (
                <div key={review.createdAt.toISOString()} className="border-l-2 border-roots-green/20 pl-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-roots-navy">
                      {humanizeStatus(review.decision)}
                    </span>
                    <span className="text-xs text-roots-navy/50">
                      {formatDateTime(review.createdAt)}
                    </span>
                  </div>
                  {review.customerMessage && (
                    <p className="mt-1 text-sm text-roots-navy/70">{review.customerMessage}</p>
                  )}
                </div>
              ))}
              {consultation.reviews.length === 0 && (
                <p className="text-sm text-roots-navy/50">
                  {consultation.status === "submitted"
                    ? "Your consultation is in the queue for prescriber review."
                    : consultation.status === "draft"
                      ? "Complete and submit your consultation to be reviewed."
                      : "No review activity yet."}
                </p>
              )}
            </div>
          </Section>

          {/* Health Summary (from answers) */}
          {answers && (
            <Section title="Health Summary">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Field label="Height" value={`${answers.heightCm} cm`} />
                <Field label="Weight" value={`${answers.weightKg} kg`} />
                <Field label="BMI" value={answers.bmi.toFixed(1)} />
                <Field label="Medical conditions" value={answers.hasMedicalConditions ? "Yes" : "No"} />
                {answers.medicalConditionsText && (
                  <Field label="Conditions detail" value={answers.medicalConditionsText} />
                )}
                <Field label="Prior GLP-1 use" value={answers.hasPriorGlp1Use ? "Yes" : "No"} />
                <Field label="GP registered" value={answers.gpDetails ?? "—"} />
              </div>
            </Section>
          )}

          {/* Uploads */}
          {consultation.uploads.length > 0 && (
            <Section title="Uploads">
              <div className="space-y-2">
                {consultation.uploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between text-sm">
                    <span className="text-roots-navy">
                      {humanizeStatus(upload.uploadType)}
                    </span>
                    <span className="text-roots-navy/50">
                      {humanizeStatus(upload.status)} · {upload.fileName}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Dates */}
          <Section title="Key Dates">
            <div className="space-y-3">
              <Field label="Started" value={formatDateTime(consultation.startedAt)} />
              {consultation.submittedAt && (
                <Field label="Submitted" value={formatDateTime(consultation.submittedAt)} />
              )}
              {consultation.approvedAt && (
                <Field label="Approved" value={formatDateTime(consultation.approvedAt)} />
              )}
              {consultation.rejectedAt && (
                <Field label="Rejected" value={formatDateTime(consultation.rejectedAt)} />
              )}
            </div>
          </Section>

          {/* Prescription */}
          {prescription && (
            <Section title="Prescription">
              <div className="space-y-3">
                <Field label="Reference" value={prescription.referenceCode} />
                <Field label="Directions" value={prescription.directions} />
                <Field label="Issued" value={formatDate(prescription.issuedAt)} />
              </div>
            </Section>
          )}

          {/* Linked Order */}
          {order && (
            <Section title="Order">
              <Link
                href={`/account/orders/${order.id}`}
                className="text-sm font-medium text-roots-green underline"
              >
                {order.orderNumber}
              </Link>
              <p className="mt-1 text-xs text-roots-navy/50">
                Payment: {humanizeStatus(order.paymentStatus)}
              </p>
            </Section>
          )}

          {/* Product */}
          {consultation.productVariant && (
            <Section title="Product">
              <Field label="Variant" value={consultation.productVariant.name} />
              <Field label="Price" value={formatPrice(consultation.productVariant.priceMinor)} />
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
