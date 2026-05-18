import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { RefillForm } from "./refill-form";

export const metadata: Metadata = {
  title: "Refill Consultation — Mounjaro",
  description:
    "Quick follow-up consultation for returning Mounjaro patients. Reviewed by a qualified prescriber.",
};

interface RefillPageProps {
  searchParams: Promise<{ from?: string }>;
}

/**
 * Refill consultation entry point. Requires a `?from=<consultationId>`
 * query param pointing at a prior approved + captured Mounjaro consult.
 *
 * All eligibility is enforced server-side here AND inside
 * `submitRefillConsultation` so a hand-crafted query string cannot
 * bypass the rules. Mirrors the resume-vs-start logic on the fresh
 * consultation page: if the user already has an active consultation
 * we send them to wherever they need to be next, not to a new form.
 */
const RESUMABLE_STATUSES = ["draft", "submitted"] as const;
const ACCOUNT_STATUSES = ["under_review", "action_required"] as const;

export default async function MounjaroRefillPage({
  searchParams,
}: RefillPageProps) {
  const user = await requireUser();
  const { from } = await searchParams;

  if (!from) {
    redirect("/account/consultations");
  }

  // If they already have an active consultation, never let them open the
  // refill form — they would only hit the duplicate-active guard at submit
  // time. Send them where they need to be instead.
  const existingActive = await db.consultation.findFirst({
    where: {
      userId: user.id,
      status: { notIn: ["rejected", "expired", "approved"] },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true },
  });

  if (existingActive) {
    if (
      (RESUMABLE_STATUSES as readonly string[]).includes(existingActive.status)
    ) {
      redirect(
        `/consultations/mounjaro/select-dose?consultation=${existingActive.id}`,
      );
    }
    if (
      (ACCOUNT_STATUSES as readonly string[]).includes(existingActive.status)
    ) {
      redirect(`/account/consultations/${existingActive.id}`);
    }
  }

  // Eligibility: same rules as `submitRefillConsultation` — must own it,
  // must be approved, must have a captured payment, must have answers.
  const prev = await db.consultation.findFirst({
    where: {
      id: from,
      userId: user.id,
      status: "approved",
    },
    select: {
      id: true,
      answers: {
        select: {
          weightKg: true,
          heightCm: true,
        },
      },
      orders: {
        where: { paymentStatus: "captured" },
        select: { id: true },
      },
    },
  });

  if (!prev || !prev.answers || prev.orders.length === 0) {
    redirect("/account/consultations");
  }

  return (
    <>
      <Header />
      <main className="bg-roots-cream">
        <div className="page-container py-12 md:py-16">
          <div className="mx-auto max-w-2xl">
            <div className="mb-10 text-center">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-roots-green/60">
                Refill consultation
              </p>
              <h1 className="font-serif-display mb-4 text-roots-green text-[40px] md:text-[56px]">
                Welcome back
              </h1>
              <p className="mx-auto max-w-lg text-base text-roots-navy/70">
                Because you have completed a consultation before, we only need
                a short update. Your prescriber will use this together with
                your prior consultation to authorise your next supply.
              </p>
            </div>

            <RefillForm
              prevConsultationId={prev.id}
              priorWeightKg={prev.answers.weightKg ?? null}
              priorHeightCm={prev.answers.heightCm}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
