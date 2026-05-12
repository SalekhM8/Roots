import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCustomerConsultations } from "@/server/queries/account";
import { AccountNav } from "@/components/account/account-nav";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { ChecklistIcon } from "@/components/icons";
import { ROUTES } from "@/lib/constants";
import { formatDate, parsePage, humanizeStatus } from "@/lib/utils";
import { consultationStatusVariant } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "My Consultations",
};

interface ConsultationsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ConsultationsPage({ searchParams }: ConsultationsPageProps) {
  const user = await requireUser();
  const { page: pageStr } = await searchParams;
  const page = parsePage(pageStr);
  const { consultations, total, pageSize } = await getCustomerConsultations(user.id, page);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="page-container py-16 md:py-20">
      <h1 className="mb-2 text-[32px] font-medium text-roots-green md:text-[42px]">
        My Consultations
      </h1>
      <p className="mb-8 text-roots-navy/60">
        View and track your consultation status.
      </p>

      <AccountNav />

      <div className="mt-8">
        {consultations.length === 0 ? (
          <EmptyState
            icon={<ChecklistIcon size={48} />}
            message="No consultations yet"
            actionLabel="Start a consultation"
            actionHref={ROUTES.consultation}
          />
        ) : (
          <div className="space-y-4">
            {consultations.map((c) => {
              const latestReview = c.reviews[0];
              // A consultation needs "Continue to checkout" if it's in a
              // resumable status and no linked order has a successful
              // payment yet. Failed/pending orders don't count — those
              // are the very ones the customer is here to retry.
              const hasPaidOrder = c.orders.some(
                (o) =>
                  o.paymentStatus === "authorized" ||
                  o.paymentStatus === "captured",
              );
              const canResumeCheckout =
                (c.status === "submitted" || c.status === "approved") &&
                !hasPaidOrder;
              return (
                <div
                  key={c.id}
                  className="rounded-[var(--radius-card)] border border-roots-green/10 bg-white p-5 transition-colors hover:border-roots-green/25"
                >
                  <Link
                    href={`/account/consultations/${c.id}`}
                    className="block"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-roots-navy">{c.product.name}</p>
                        {c.productVariant && (
                          <p className="text-sm text-roots-navy/50">{c.productVariant.name}</p>
                        )}
                      </div>
                      <StatusPill variant={consultationStatusVariant(c.status)}>
                        {humanizeStatus(c.status)}
                      </StatusPill>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-roots-navy/50">
                      {c.submittedAt && <span>Submitted {formatDate(c.submittedAt)}</span>}
                      {c.approvedAt && <span>Approved {formatDate(c.approvedAt)}</span>}
                      {c.rejectedAt && <span>Rejected {formatDate(c.rejectedAt)}</span>}
                    </div>
                    {latestReview?.customerMessage && (
                      <p className="mt-2 text-sm text-roots-navy/70">
                        {latestReview.customerMessage}
                      </p>
                    )}
                  </Link>
                  {canResumeCheckout && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-input)] border border-roots-orange/30 bg-roots-orange/5 px-4 py-3">
                      <p className="text-sm text-roots-navy">
                        Payment not completed — finish your order to send it
                        to a prescriber.
                      </p>
                      <Link
                        href={`/consultations/mounjaro/select-dose?consultation=${c.id}`}
                        className="inline-flex items-center rounded-[var(--radius-input)] bg-roots-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-roots-green/90"
                      >
                        Continue to checkout
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}

            <AdminPagination basePath="/account/consultations" page={page} totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}
