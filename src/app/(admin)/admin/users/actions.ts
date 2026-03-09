"use server";

import { requireAnyRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/security/audit";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Role } from "@/generated/prisma/client";

interface ActionResult {
  success: boolean;
  error?: string;
}

const assignRoleSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "prescriber"]),
});

export async function assignRoleAction(
  input: z.infer<typeof assignRoleSchema>
): Promise<ActionResult> {
  const actor = await requireAnyRole("admin");
  const rl = checkRateLimit("admin", actor.id);
  if (!rl.allowed) return { success: false, error: "Too many requests." };

  const parsed = assignRoleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const { email, role } = parsed.data;

  const user = await db.user.findUnique({
    where: { email },
    include: { roles: true },
  });

  if (!user) {
    return { success: false, error: `No user found with email: ${email}` };
  }

  const alreadyHasRole = user.roles.some((r) => r.role === role);
  if (alreadyHasRole) {
    return { success: false, error: `User already has the ${role} role.` };
  }

  await db.userRole.create({
    data: {
      userId: user.id,
      role: role as Role,
    },
  });

  await writeAuditLog({
    actorUserId: actor.id,
    actorRole: "admin",
    entityType: "UserRole",
    entityId: user.id,
    action: "role.assigned",
    newState: { email, role },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

const removeRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["admin", "prescriber"]),
});

export async function removeRoleAction(
  input: z.infer<typeof removeRoleSchema>
): Promise<ActionResult> {
  const actor = await requireAnyRole("admin");
  const rl = checkRateLimit("admin", actor.id);
  if (!rl.allowed) return { success: false, error: "Too many requests." };

  const parsed = removeRoleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const { userId, role } = parsed.data;

  // Prevent removing your own admin role
  if (userId === actor.id && role === "admin") {
    return { success: false, error: "You cannot remove your own admin role." };
  }

  const userRole = await db.userRole.findUnique({
    where: { userId_role: { userId, role: role as Role } },
  });

  if (!userRole) {
    return { success: false, error: "User does not have this role." };
  }

  await db.userRole.delete({
    where: { id: userRole.id },
  });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  await writeAuditLog({
    actorUserId: actor.id,
    actorRole: "admin",
    entityType: "UserRole",
    entityId: userId,
    action: "role.removed",
    previousState: { email: user?.email, role },
  });

  revalidatePath("/admin/users");
  return { success: true };
}
