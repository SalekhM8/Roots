import type { Metadata } from "next";
import { db } from "@/lib/db";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/ui/status-pill";
import { formatDateTime, parsePage } from "@/lib/utils";
import { AssignRoleForm } from "./assign-role-form";
import { RemoveRoleButton } from "./remove-role-button";

export const metadata: Metadata = {
  title: "Admin Users",
};

const PAGE_SIZE = 25;

interface UsersPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

async function getUsersList(page: number, search?: string) {
  const skip = (page - 1) * PAGE_SIZE;

  const where = search?.trim()
    ? {
        OR: [
          { email: { contains: search.trim(), mode: "insensitive" as const } },
          {
            customerProfile: {
              firstName: { contains: search.trim(), mode: "insensitive" as const },
            },
          },
          {
            customerProfile: {
              lastName: { contains: search.trim(), mode: "insensitive" as const },
            },
          },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        roles: true,
        customerProfile: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    db.user.count({ where }),
  ]);

  return { users, total, pageSize: PAGE_SIZE };
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const { page: pageStr, q } = await searchParams;
  const page = parsePage(pageStr);
  const { users, total, pageSize } = await getUsersList(page, q);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 md:p-10">
      <h1 className="mb-2 text-2xl font-medium text-roots-green">Users</h1>
      <p className="mb-8 text-sm text-roots-navy/50">
        {total} users &middot; manage roles and permissions.
      </p>

      {/* Assign Role Form */}
      <div className="mb-8 rounded-[var(--radius-card)] border border-roots-green/10 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-roots-navy">Assign Role</h2>
        <AssignRoleForm />
      </div>

      {/* Search */}
      <form className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by email or name..."
            className="w-full max-w-sm rounded-lg border border-roots-green/15 px-3 py-2 text-sm focus:border-roots-green focus:outline-none focus:ring-1 focus:ring-roots-green"
          />
          <button
            type="submit"
            className="rounded-lg bg-roots-green px-4 py-2 text-sm font-medium text-roots-cream hover:bg-roots-green/90"
          >
            Search
          </button>
        </div>
      </form>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-roots-green/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-roots-green/10 text-xs font-medium uppercase tracking-wider text-roots-navy/50">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td className="px-4 py-12 text-center text-roots-navy/30" colSpan={5}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const displayName = user.customerProfile
                  ? `${user.customerProfile.firstName} ${user.customerProfile.lastName}`
                  : null;

                return (
                  <tr
                    key={user.id}
                    className="border-b border-roots-green/5 last:border-0"
                  >
                    <td className="px-4 py-3">
                      {displayName && (
                        <p className="font-medium text-roots-navy">{displayName}</p>
                      )}
                      <p className="text-xs text-roots-navy/50">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <StatusPill
                            key={r.id}
                            variant={
                              r.role === "admin"
                                ? "danger"
                                : r.role === "prescriber"
                                  ? "warning"
                                  : "neutral"
                            }
                          >
                            {r.role}
                          </StatusPill>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill variant={user.isActive ? "success" : "neutral"}>
                        {user.isActive ? "active" : "inactive"}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3 text-roots-navy/70">
                      {formatDateTime(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles
                          .filter((r) => r.role !== "customer")
                          .map((r) => (
                            <RemoveRoleButton
                              key={r.id}
                              userId={user.id}
                              role={r.role as "admin" | "prescriber"}
                            />
                          ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        basePath="/admin/users"
        page={page}
        totalPages={totalPages}
        extraParams={q ? { q } : undefined}
      />
    </div>
  );
}
