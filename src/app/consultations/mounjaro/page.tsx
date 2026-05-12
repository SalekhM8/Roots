import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ConsultationForm from "@/components/consultation/consultation-form";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Mounjaro Consultation",
  description:
    "Complete a medical consultation for the Mounjaro weight loss programme. Reviewed by a qualified prescriber.",
};

/**
 * Customers who already have an IN-FLIGHT Mounjaro consultation should
 * never be shown the form again — the duplicate-submit guard in
 * `submitConsultation` would reject them at the end anyway, and forcing
 * them to re-answer 30+ questions just to discover that is hostile UX.
 *
 * Terminal statuses (rejected / expired / approved) are excluded from
 * this guard so the customer is free to start a fresh consultation:
 * - rejected / expired → previous attempt is done, retry from scratch
 * - approved           → previous order is complete; this is a repeat
 *                        purchase, which is the whole Mounjaro business.
 *
 * Guests (no Clerk session) still see the form; the auth gate inside the
 * form will route them through sign-in and the duplicate-check kicks in
 * server-side on submit as a final backstop.
 */
// Statuses where the customer should jump back into dose-select + checkout.
const RESUMABLE_STATUSES = ["draft", "submitted"] as const;
// Statuses owned by prescriber action — customer is sent to the detail page.
const ACCOUNT_STATUSES = ["under_review", "action_required"] as const;

export default async function MounjaroConsultationPage() {
  const user = await getCurrentUser();

  if (user) {
    const existing = await db.consultation.findFirst({
      where: {
        userId: user.id,
        // Match the INACTIVE_STATUSES list in server/services/consultation.ts
        // exactly. If you add a status here, add it there too — or the form
        // and the submit handler will disagree about who is allowed to start.
        status: { notIn: ["rejected", "expired", "approved"] },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true },
    });

    if (existing) {
      if ((RESUMABLE_STATUSES as readonly string[]).includes(existing.status)) {
        redirect(
          `/consultations/mounjaro/select-dose?consultation=${existing.id}`,
        );
      }
      if ((ACCOUNT_STATUSES as readonly string[]).includes(existing.status)) {
        redirect(`/account/consultations/${existing.id}`);
      }
    }
  }

  return (
    <>
      <Header />
      <main className="bg-roots-cream">
        <div className="page-container py-16 md:py-20">
          <div className="mx-auto max-w-2xl">
            <ConsultationForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
