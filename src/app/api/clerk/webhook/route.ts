import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { syncClerkUser } from "@/lib/auth";

/**
 * Clerk webhook handler — syncs users to our DB.
 *
 * Configure in Clerk Dashboard:
 *   Webhook URL: https://yourdomain.com/api/clerk/webhook
 *   Events: user.created, user.updated, user.deleted
 *   Signing secret → CLERK_WEBHOOK_SECRET env var
 */
export async function POST(req: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  let event: { type: string; data: Record<string, unknown> };
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, email_addresses } = event.data as {
      id: string;
      email_addresses: Array<{ email_address: string }>;
    };
    const primaryEmail = email_addresses[0]?.email_address;

    if (id && primaryEmail) {
      await syncClerkUser(id, primaryEmail);
    }
  }

  if (event.type === "user.deleted") {
    const { id } = event.data as { id: string };
    if (id) {
      // Soft-delete: deactivate the user rather than destroying data
      const { db } = await import("@/lib/db");
      await db.user.updateMany({
        where: { clerkUserId: id },
        data: { isActive: false },
      });
    }
  }

  return NextResponse.json({ received: true });
}
