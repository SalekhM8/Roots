import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { PhotoUploader } from "./photo-uploader";

export const metadata: Metadata = {
  title: "Upload Photos — Mounjaro Consultation",
  description:
    "Upload your body photos and photo ID for your Mounjaro consultation.",
};

interface UploadPhotosPageProps {
  searchParams: Promise<{ consultation?: string }>;
}

export default async function UploadPhotosPage({ searchParams }: UploadPhotosPageProps) {
  const user = await requireUser();
  const { consultation: consultationId } = await searchParams;

  if (!consultationId) {
    redirect(ROUTES.consultation);
  }

  // Verify the consultation belongs to this user and is in "submitted" status
  const consultation = await db.consultation.findFirst({
    where: {
      id: consultationId,
      userId: user.id,
      status: "submitted",
    },
    select: { id: true },
  });

  if (!consultation) {
    redirect(ROUTES.consultation);
  }

  return (
    <>
      <Header />
      <main className="bg-roots-cream">
        <div className="page-container py-12 md:py-20">
          <div className="mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-10 text-center">
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-roots-green/60">
                Consultation submitted
              </p>
              <h1 className="mb-3 text-[32px] font-medium text-roots-green md:text-[42px]">
                Upload Your Photos
              </h1>
              <p className="mx-auto max-w-lg text-base text-roots-navy/70">
                Your prescriber needs a few photos to complete your assessment.
                Please upload clear, well-lit images.
              </p>
            </div>

            {/* Instructions */}
            <div className="mb-8 rounded-[var(--radius-card)] border border-roots-green/10 bg-white p-6">
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
            <PhotoUploader consultationId={consultation.id} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
