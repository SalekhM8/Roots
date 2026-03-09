import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Role } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import { syncClerkUser } from "./sync";

/**
 * Get the current user's app DB record from their Clerk session.
 * Self-healing: if user exists in Clerk but not in our DB (e.g. webhook failed),
 * automatically syncs them on first request.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  let user = await db.user.findUnique({
    where: { clerkUserId },
    include: { roles: true },
  });

  // Self-heal: user has valid Clerk session but isn't in our DB
  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
    if (email) {
      user = await syncClerkUser(clerkUserId, email);
    }
  }

  return user;
}

/**
 * Get current user or redirect to sign-in.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

/**
 * Check if user has a specific role. Server-side only.
 */
export async function requireRole(role: Role) {
  const user = await requireUser();
  const hasRole = user.roles.some((r) => r.role === role);
  if (!hasRole) redirect("/");
  return user;
}

/**
 * Check if user has any of the specified roles.
 */
export async function requireAnyRole(...roles: Role[]) {
  const user = await requireUser();
  const hasRole = user.roles.some((r) => roles.includes(r.role));
  if (!hasRole) redirect("/");
  return user;
}

/**
 * Check if a user record has a specific role (from already-loaded data).
 */
export function hasRole(
  user: { roles: Array<{ role: Role }> },
  role: Role
): boolean {
  return user.roles.some((r) => r.role === role);
}
