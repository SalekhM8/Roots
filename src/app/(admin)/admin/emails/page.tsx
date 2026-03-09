import type { Metadata } from "next";
import { getEmailEvents } from "@/server/queries/admin";
import { StatusPill } from "@/components/ui/status-pill";
import { AdminPagination } from "@/components/admin/pagination";
import { formatDateTime, parsePage, humanizeStatus } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Email Events",
};

interface EmailsPageProps {
  searchParams: Promise<{ page?: string }>;
}

function emailStatusVariant(status: string) {
  const map: Record<string, "success" | "danger" | "pending" | "neutral"> = {
    sent: "success",
    delivered: "success",
    failed: "danger",
    bounced: "danger",
    queued: "pending",
  };
  return map[status] ?? "neutral";
}

export default async function EmailEventsPage({
  searchParams,
}: EmailsPageProps) {
  const { page: pageStr } = await searchParams;
  const page = parsePage(pageStr);
  const { events, total, pageSize } = await getEmailEvents(page);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 md:p-10">
      <h1 className="mb-2 text-2xl font-medium text-roots-green">
        Email Events
      </h1>
      <p className="mb-6 text-sm text-roots-navy/50">
        {total} email event{total !== 1 ? "s" : ""} recorded
      </p>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-roots-green/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-roots-green/10 text-xs font-medium uppercase tracking-wider text-roots-navy/50">
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sent At</th>
              <th className="px-4 py-3">Error</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-12 text-center text-roots-navy/30"
                  colSpan={5}
                >
                  No email events found
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-roots-green/5 last:border-0"
                >
                  <td className="px-4 py-3 text-roots-navy/70">
                    {event.user.email}
                  </td>
                  <td className="px-4 py-3 text-roots-navy/70">
                    {humanizeStatus(event.emailType)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill variant={emailStatusVariant(event.status)}>
                      {humanizeStatus(event.status)}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3 text-roots-navy/70">
                    {formatDateTime(event.sentAt)}
                  </td>
                  <td className="px-4 py-3 text-xs text-red-600">
                    {event.status === "failed" && event.providerMessageId
                      ? event.providerMessageId
                      : ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        basePath="/admin/emails"
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
