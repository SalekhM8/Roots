"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { addressSchema, type AddressInput } from "@/lib/validation/schemas";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function addAddressAction(input: AddressInput): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid address." };
  }

  const data = parsed.data;

  await db.$transaction(async (tx) => {
    // Clear existing defaults if this is set as default
    if (data.isDefaultShipping) {
      await tx.address.updateMany({
        where: { userId: user.id, isDefaultShipping: true },
        data: { isDefaultShipping: false },
      });
    }
    if (data.isDefaultBilling) {
      await tx.address.updateMany({
        where: { userId: user.id, isDefaultBilling: true },
        data: { isDefaultBilling: false },
      });
    }

    await tx.address.create({
      data: {
        userId: user.id,
        label: data.label,
        firstName: data.firstName,
        lastName: data.lastName,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        postcode: data.postcode,
        countryCode: data.countryCode,
        phone: data.phone,
        isDefaultShipping: data.isDefaultShipping,
        isDefaultBilling: data.isDefaultBilling,
      },
    });
  });

  return { success: true };
}

export async function updateAddressAction(
  addressId: string,
  input: AddressInput
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid address." };
  }

  // Verify ownership
  const existing = await db.address.findFirst({
    where: { id: addressId, userId: user.id },
    select: { id: true },
  });
  if (!existing) {
    return { success: false, error: "Address not found." };
  }

  const data = parsed.data;

  await db.$transaction(async (tx) => {
    if (data.isDefaultShipping) {
      await tx.address.updateMany({
        where: { userId: user.id, isDefaultShipping: true, id: { not: addressId } },
        data: { isDefaultShipping: false },
      });
    }
    if (data.isDefaultBilling) {
      await tx.address.updateMany({
        where: { userId: user.id, isDefaultBilling: true, id: { not: addressId } },
        data: { isDefaultBilling: false },
      });
    }

    await tx.address.update({
      where: { id: addressId },
      data: {
        label: data.label,
        firstName: data.firstName,
        lastName: data.lastName,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        postcode: data.postcode,
        countryCode: data.countryCode,
        phone: data.phone,
        isDefaultShipping: data.isDefaultShipping,
        isDefaultBilling: data.isDefaultBilling,
      },
    });
  });

  return { success: true };
}

export async function deleteAddressAction(addressId: string): Promise<ActionResult> {
  const user = await requireUser();

  const existing = await db.address.findFirst({
    where: { id: addressId, userId: user.id },
    select: { id: true },
  });
  if (!existing) {
    return { success: false, error: "Address not found." };
  }

  await db.address.delete({ where: { id: addressId } });
  return { success: true };
}
