import Link from "next/link";

interface AdminPaginationProps {
  basePath: string;
  page: number;
  totalPages: number;
  /** Extra search params to preserve when paginating (e.g. q, status, type) */
  extraParams?: Record<string, string>;
}

function buildHref(basePath: string, page: number, extraParams?: Record<string, string>) {
  const params = new URLSearchParams();
  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) {
      if (v) params.set(k, v);
    }
  }
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

export function AdminPagination({
  basePath,
  page,
  totalPages,
  extraParams,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-roots-navy/50">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={buildHref(basePath, page - 1, extraParams)}
            className="rounded-lg border border-roots-green/15 px-3 py-1.5 text-roots-green hover:bg-roots-green/5"
          >
            Previous
          </Link>
        )}
        {page < totalPages && (
          <Link
            href={buildHref(basePath, page + 1, extraParams)}
            className="rounded-lg border border-roots-green/15 px-3 py-1.5 text-roots-green hover:bg-roots-green/5"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
