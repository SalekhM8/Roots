import { db } from "@/lib/db";

/**
 * Sync a Clerk user to the app database.
 * Called after sign-up or on first authenticated request if user doesn't exist.
 * Creates user record + customer role.
 */
export async function syncClerkUser(clerkUserId: string, email: string) {
  const user = await db.user.upsert({
    where: { clerkUserId },
    update: { email },
    create: {
      clerkUserId,
      email,
      roles: {
        create: { role: "customer" },
      },
    },
    include: { roles: true },
  });

  return user;
}
