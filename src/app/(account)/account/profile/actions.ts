"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { profileSchema, type ProfileInput } from "@/lib/validation/schemas";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateProfileAction(input: ProfileInput): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { firstName, lastName, phone, dateOfBirth } = parsed.data;

  await db.customerProfile.upsert({
    where: { userId: user.id },
    update: {
      firstName,
      lastName,
      phone: phone ?? null,
      dateOfBirth: new Date(dateOfBirth),
    },
    create: {
      userId: user.id,
      firstName,
      lastName,
      phone: phone ?? null,
      dateOfBirth: new Date(dateOfBirth),
    },
  });

  return { success: true };
}
