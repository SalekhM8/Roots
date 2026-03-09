import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getConsultationDetail,
  consultationStatusVariant,
  paymentStatusVariant,
  getAuditLogForEntity,
} from "@/server/queries/admin";
import { StatusPill } from "@/components/ui/status-pill";
import { ReviewActions } from "@/components/admin/review-actions";
import { Section, Field } from "@/components/admin/section";
import { formatPrice, formatDateTime, calculateAge, humanizeStatus } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Review Consultation",
};

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConsultationReviewPage({
  params,
}: ReviewPageProps) {
  const { id } = await params;

  const [consultation, auditLog] = await Promise.all([
    getConsultationDetail(id),
    getAuditLogForEntity("Consultation", id),
  ]);

  if (!consultation) notFound();

  const profile = consultation.user.customerProfile;
  const answers = consultation.answers;
  const order = consultation.orders[0];
  const payment = order?.payments[0];
  const isReviewable =
    consultation.status === "submitted" ||
    consultation.status === "under_review";

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/consultations"
          className="text-sm text-roots-green/70 hover:text-roots-green"
        >
          &larr; Back to queue
        </Link>
        <StatusPill variant={consultationStatusVariant(consultation.status)}>
          {humanizeStatus(consultation.status)}
        </StatusPill>
      </div>

      <h1 className="mb-8 text-2xl font-medium text-roots-green">
        Review Consultation
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content - 2 cols */}
        <div className="space-y-6 lg:col-span-2">
          {/* Patient Summary */}
          <Section title="Patient Summary">
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Field
                label="Name"
                value={
                  profile
                    ? `${profile.firstName} ${profile.lastName}`
                    : "No profile"
                }
              />
              <Field label="Email" value={consultation.user.email} />
              <Field label="Phone" value={profile?.phone ?? "—"} />
              <Field
                label="Date of Birth"
                value={
                  profile?.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString("en-GB")
                    : "—"
                }
              />
              <Field
                label="Age"
                value={
                  profile?.dateOfBirth
                    ? calculateAge(profile.dateOfBirth)
                    : "—"
                }
              />
            </dl>
          </Section>

          {/* Metrics */}
          {answers && (
            <Section title="Metrics">
              <dl className="grid grid-cols-3 gap-4">
                <Field label="Height" value={`${answers.heightCm} cm`} />
                <Field label="Weight" value={`${answers.weightKg} kg`} />
                <Field
                  label="BMI"
                  value={
                    <span
                      className={
                        answers.bmi >= 30
                          ? "font-medium text-roots-green"
                          : answers.bmi >= 27
                            ? "text-amber-600"
                            : "text-red-600"
                      }
                    >
                      {answers.bmi.toFixed(1)}
                    </span>
                  }
                />
              </dl>
            </Section>
          )}

          {/* Clinical Content */}
          {answers && (
            <Section title="Clinical Answers">
              <dl className="space-y-4">
                <Field
                  label="Medical conditions"
                  value={
                    answers.hasMedicalConditions
                      ? answers.medicalConditionsText || "Yes (no details)"
                      : "None reported"
                  }
                />
                <Field
                  label="Current medications"
                  value={answers.currentMedicationsText || "None reported"}
                />
                <div>
                  <dt className="text-sm font-medium text-roots-navy/50">Specific conditions</dt>
                  <dd className="mt-1">
                    {(() => {
                      const conditions = [
                        { flag: answers.hasEpilepsy, label: "Epilepsy" },
                        { flag: answers.hasHighCholesterol, label: "High cholesterol" },
                        { flag: answers.hasDiabetes, label: "Diabetes" },
                        { flag: answers.hasGalactoseIntolerance, label: "Galactose intolerance" },
                        { flag: answers.hasLappLactaseDeficiency, label: "Lapp lactase deficiency" },
                        { flag: answers.hasGlucoseGalactoseMalabsorption, label: "Glucose-galactose malabsorption" },
                        { flag: answers.hasLiverKidneyProblems, label: "Liver or kidney problems" },
                        { flag: answers.hasIbd, label: "IBD/colitis/Crohn's" },
                        { flag: answers.hasThyroidProblems, label: "Thyroid problems" },
                        { flag: answers.hasDepression, label: "Depression or mood disorder" },
                      ];
                      const active = conditions.filter((c) => c.flag);
                      if (active.length === 0) {
                        return <span className="text-sm text-roots-navy/70">None reported</span>;
                      }
                      return (
                        <ul className="space-y-1">
                          {active.map((c) => (
                            <li key={c.label} className="flex items-center gap-2 text-sm text-roots-navy/80">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                              {c.label}
                            </li>
                          ))}
                        </ul>
                      );
                    })()}
                  </dd>
                </div>
                <Field
                  label="Prior GLP-1 use"
                  value={
                    answers.hasPriorGlp1Use
                      ? answers.priorGlp1Details || "Yes (no details)"
                      : "No"
                  }
                />
                <Field
                  label="Pregnant / breastfeeding"
                  value={answers.isPregnantOrBreastfeeding ? "Yes" : "No"}
                />
                <Field
                  label="Pancreatitis history"
                  value={answers.hasPancreatitisHistory ? "Yes" : "No"}
                />
                <Field
                  label="Eating disorder history"
                  value={answers.hasEatingDisorderHistory ? "Yes" : "No"}
                />
                <Field
                  label="Allergies"
                  value={
                    answers.hasAllergies
                      ? answers.allergiesText || "Yes (no details)"
                      : "None"
                  }
                />
                <Field
                  label="Alcohol"
                  value={answers.drinksAlcohol ? "Yes" : "No"}
                />
                <Field
                  label="Disabilities"
                  value={answers.hasDisabilities ? "Yes" : "No"}
                />
                <Field label="GP Details" value={answers.gpDetails} />
              </dl>
            </Section>
          )}

          {/* Safety Confirmations */}
          {answers && (
            <Section title="Safety Confirmations">
              <div className="space-y-2 text-sm">
                <p className="text-roots-navy/70">
                  Consent confirmed:{" "}
                  <strong>
                    {answers.consentConfirmed ? "Yes" : "No"}
                  </strong>
                </p>
                {answers.safetyConfirmationsJson &&
                  typeof answers.safetyConfirmationsJson === "object" &&
                  Object.entries(
                    answers.safetyConfirmationsJson as Record<string, boolean>
                  ).map(([key, val]) => (
                    <p key={key} className="text-roots-navy/70">
                      {key.replace(/([A-Z])/g, " $1").toLowerCase()}:{" "}
                      <strong>{val ? "Yes" : "No"}</strong>
                    </p>
                  ))}
              </div>
            </Section>
          )}

          {/* Previous Reviews */}
          {consultation.reviews.length > 0 && (
            <Section title="Review History">
              <div className="space-y-4">
                {consultation.reviews.map((review) => {
                  const reviewerProfile =
                    review.prescriber.customerProfile;
                  return (
                    <div
                      key={review.id}
                      className="border-b border-roots-green/5 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-roots-navy">
                          {reviewerProfile
                            ? `${reviewerProfile.firstName} ${reviewerProfile.lastName}`
                            : "Prescriber"}
                        </span>
                        <span className="text-roots-navy/40">·</span>
                        <span className="text-roots-navy/50">
                          {formatDateTime(review.createdAt)}
                        </span>
                        <StatusPill
                          variant={
                            review.decision === "approved"
                              ? "success"
                              : review.decision === "rejected"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {humanizeStatus(review.decision)}
                        </StatusPill>
                      </div>
                      {review.internalNote && (
                        <p className="mt-2 text-sm text-roots-navy/60">
                          <em>Internal: {review.internalNote}</em>
                        </p>
                      )}
                      {review.customerMessage && (
                        <p className="mt-1 text-sm text-roots-navy/80">
                          To customer: {review.customerMessage}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Section title="Actions">
            <ReviewActions
              consultationId={consultation.id}
              isReviewable={isReviewable}
            />
          </Section>

          {/* Commerce Context */}
          <Section title="Commerce">
            <dl className="space-y-3">
              <Field
                label="Product"
                value={consultation.product.name}
              />
              <Field
                label="Variant"
                value={consultation.productVariant?.name ?? "Not selected"}
              />
              {order && (
                <>
                  <Field label="Order #" value={order.orderNumber} />
                  <Field
                    label="Payment"
                    value={
                      payment && (
                        <StatusPill
                          variant={paymentStatusVariant(payment.status)}
                        >
                          {payment.status}
                        </StatusPill>
                      )
                    }
                  />
                  <Field
                    label="Amount"
                    value={
                      payment ? formatPrice(payment.amountMinor) : "—"
                    }
                  />
                  <Field
                    label="Auth Expiry"
                    value={
                      payment?.captureBefore
                        ? formatDateTime(payment.captureBefore)
                        : "—"
                    }
                  />
                </>
              )}
            </dl>
          </Section>

          {/* Uploads */}
          <Section title="Uploads">
            {consultation.uploads.length === 0 ? (
              <p className="text-sm text-roots-navy/40">No uploads</p>
            ) : (
              <div className="space-y-2">
                {consultation.uploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-roots-navy/70">
                      {humanizeStatus(upload.uploadType)}
                    </span>
                    <StatusPill
                      variant={
                        upload.status === "uploaded" ||
                        upload.status === "accepted"
                          ? "success"
                          : upload.status === "rejected"
                            ? "danger"
                            : "pending"
                      }
                    >
                      {upload.status}
                    </StatusPill>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Audit Timeline */}
          <Section title="Audit Log">
            {auditLog.length === 0 ? (
              <p className="text-sm text-roots-navy/40">No audit entries</p>
            ) : (
              <div className="space-y-3">
                {auditLog.map((entry) => (
                  <div key={entry.id} className="text-sm">
                    <p className="font-medium text-roots-navy/80">
                      {entry.action}
                    </p>
                    <p className="text-xs text-roots-navy/40">
                      {entry.actor?.customerProfile
                        ? `${entry.actor.customerProfile.firstName} ${entry.actor.customerProfile.lastName}`
                        : entry.actorRole ?? "System"}{" "}
                      · {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
