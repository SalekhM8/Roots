import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants";
import {
  consultationNeedsPhotos,
  findPaidOrder,
} from "@/lib/consultation/photos";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { PhotoUploader } from "./photo-uploader";

export const metadata: Metadata = {
  title: "Upload Photos — Mounjaro Consultation",
  description:
    "Upload your body photos and photo ID for your Mounjaro consultation.",
};

// Payment status races the Viva webhook: a customer can land here seconds after
// paying, before the 1796 webhook has flipped the order to `authorized`. We must
// re-fetch fresh and (when still pending) show a brief "confirming" screen that
// refreshes — never bounce them into a redirect loop.
export const dynamic = "force-dynamic";

interface UploadPhotosPageProps {
  searchParams: Promise<{ consultation?: string }>;
}

export default async function UploadPhotosPage({ searchParams }: UploadPhotosPageProps) {
  const user = await requireUser();
  const { consultation: consultationId } = await searchParams;

  if (!consultationId) {
    redirect(ROUTES.consultation);
  }

  // Photos are a POST-PAYMENT step. Verify ownership, that the consultation is
  // still in an upload-accepting state, that it actually needs photos (refills
  // are excluded), and that the customer has paid.
  const consultation = await db.consultation.findFirst({
    where: { id: consultationId, userId: user.id },
    select: {
      id: true,
      status: true,
      answers: { select: { answersJson: true } },
      orders: {
        select: { id: true, paymentStatus: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!consultation) {
    redirect(ROUTES.consultation);
  }

  // Refills skip photos entirely — send them to their consultation record.
  if (!consultationNeedsPhotos(consultation.answers?.answersJson)) {
    redirect(`/account/consultations/${consultation.id}`);
  }

  // Already decided (approved/rejected/expired) → nothing to upload.
  if (
    consultation.status !== "submitted" &&
    consultation.status !== "action_required"
  ) {
    redirect(`/account/consultations/${consultation.id}`);
  }

  const paidOrder = findPaidOrder(consultation.orders);
  const pendingOrder = consultation.orders.find(
    (o) => o.paymentStatus === "pending",
  );

  // No paid order at all (never checked out / failed / expired) → back to dose
  // selection so they can pay first. Photos are gated behind payment now.
  if (!paidOrder && !pendingOrder) {
    redirect(`/consultations/mounjaro/select-dose?consultation=${consultation.id}`);
  }

  // Payment is mid-flight (webhook hasn't landed). Show a brief confirming
  // screen that refreshes rather than bouncing the customer around.
  if (!paidOrder && pendingOrder) {
    return (
      <>
        <Header />
        <main className="bg-roots-cream">
          <div className="page-container py-16 md:py-24">
            <meta httpEquiv="refresh" content="3" />
            <div className="mx-auto max-w-lg text-center">
              <h1 className="mb-3 text-[32px] font-medium text-roots-navy">
                Confirming your payment…
              </h1>
              <p className="text-roots-navy/60">
                This usually takes a few seconds. We&apos;ll show your photo
                upload step as soon as it&apos;s ready — please don&apos;t close
                this page.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-roots-cream">
        <div className="page-container py-12 md:py-20">
          <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-10 text-center">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-roots-green/60">
                Payment received
              </p>
              <h1 className="font-serif-display mb-4 text-roots-green text-[40px] md:text-[56px]">
                Upload your photos
              </h1>
              <p className="mx-auto max-w-lg text-base text-roots-navy/70">
                One last step. Your prescriber begins your review as soon as your
                photos are uploaded — we can only approve your treatment once
                we&apos;ve received them. Please upload clear, well-lit images.
              </p>
            </div>

            {/* Instructions */}
            <div className="glass-card-strong mb-8 rounded-[var(--radius-card)] p-6">
              <h2 className="mb-4 text-lg font-medium text-roots-green">
                Photo Guidelines
              </h2>
              <ul className="space-y-3 text-sm text-roots-navy/70">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-roots-green/10 text-xs font-medium text-roots-green">
                    1
                  </span>
                  Wear form-fitting clothing so your body shape is visible.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-roots-green/10 text-xs font-medium text-roots-green">
                    2
                  </span>
                  Stand in a well-lit area with a plain background.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-roots-green/10 text-xs font-medium text-roots-green">
                    3
                  </span>
                  Your photo ID must clearly show your name and photo.
                </li>
              </ul>
            </div>

            {/* Uploader */}
            <PhotoUploader
              consultationId={consultation.id}
              orderId={paidOrder!.id}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
