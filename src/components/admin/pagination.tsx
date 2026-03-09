import Link from "next/link";

interface AdminPaginationProps {
  basePath: string;
  page: number;
  totalPages: number;
}

export function AdminPagination({
  basePath,
  page,
  totalPages,
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
            href={`${basePath}?page=${page - 1}`}
            className="rounded-lg border border-roots-green/15 px-3 py-1.5 text-roots-green hover:bg-roots-green/5"
          >
            Previous
          </Link>
        )}
        {page < totalPages && (
          <Link
            href={`${basePath}?page=${page + 1}`}
            className="rounded-lg border border-roots-green/15 px-3 py-1.5 text-roots-green hover:bg-roots-green/5"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
