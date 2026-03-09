import type { Metadata } from "next";
import Link from "next/link";
import { getConsultationQueue, consultationStatusVariant } from "@/server/queries/admin";
import { StatusPill } from "@/components/ui/status-pill";
import { AdminPagination } from "@/components/admin/pagination";
import { calculateAge, formatDate, parsePage, humanizeStatus, getDisplayName } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Prescriber Queue",
};

interface QueuePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ConsultationQueuePage({
  searchParams,
}: QueuePageProps) {
  const { page: pageStr } = await searchParams;
  const page = parsePage(pageStr);
  const { consultations, total, pageSize } = await getConsultationQueue(page);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 md:p-10">
      <h1 className="mb-2 text-2xl font-medium text-roots-green">
        Consultation Queue
      </h1>
      <p className="mb-8 text-sm text-roots-navy/50">
        {total} pending · sorted oldest first
      </p>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-roots-green/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-roots-green/10 text-xs font-medium uppercase tracking-wider text-roots-navy/50">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">BMI</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Uploads</th>
              <th className="px-4 py-3">Auth Expiry</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {consultations.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-12 text-center text-roots-navy/30"
                  colSpan={9}
                >
                  No consultations pending review
                </td>
              </tr>
            ) : (
              consultations.map((c) => {
                const name = getDisplayName(c.user);
                const age = c.user.customerProfile?.dateOfBirth
                  ? calculateAge(c.user.customerProfile.dateOfBirth)
                  : "—";
                const bmi = c.answers?.bmi
                  ? (c.answers.bmi as number).toFixed(1)
                  : "—";
                const uploadCount = c.uploads.length;
                const uploadedCount = c.uploads.filter(
                  (u) => u.status === "uploaded" || u.status === "accepted"
                ).length;
                const order = c.orders[0];
                const authExpiry = order?.payments[0]?.captureBefore;
                const isExpiringBefore48h =
                  authExpiry &&
                  new Date(authExpiry).getTime() - Date.now() <
                    48 * 60 * 60 * 1000;

                return (
                  <tr
                    key={c.id}
                    className="border-b border-roots-green/5 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-roots-navy">
                      {name}
                    </td>
                    <td className="px-4 py-3 text-roots-navy/70">{age}</td>
                    <td className="px-4 py-3 text-roots-navy/70">{bmi}</td>
                    <td className="px-4 py-3 text-roots-navy/70">
                      {c.product.name}
                    </td>
                    <td className="px-4 py-3 text-roots-navy/70">
                      {formatDate(c.submittedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill variant={consultationStatusVariant(c.status)}>
                        {humanizeStatus(c.status)}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3 text-roots-navy/70">
                      {uploadCount > 0
                        ? `${uploadedCount}/${uploadCount}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {authExpiry ? (
                        <span
                          className={
                            isExpiringBefore48h
                              ? "font-medium text-red-600"
                              : "text-roots-navy/70"
                          }
                        >
                          {formatDate(authExpiry)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/consultations/${c.id}`}
                        className="text-sm font-medium text-roots-green underline"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination basePath="/admin/consultations" page={page} totalPages={totalPages} />
    </div>
  );
}
