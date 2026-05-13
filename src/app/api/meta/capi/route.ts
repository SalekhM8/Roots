import { NextResponse } from "next/server";
import { z } from "zod";
import { sendCapiEvent } from "@/lib/observability/meta-capi";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Server-side Meta Conversions API echo endpoint.
 *
 * The browser fires `fbq("track", "Foo", params, { eventID })`. The
 * client then POSTs here with the same `event_id`, the page URL, the
 * Meta cookies (`_fbp`, `_fbc`) and the event-specific custom data.
 * This handler hashes the user's email/phone (when known) and forwards
 * to Meta's Graph API. Meta dedupes the two events by `event_id`.
 *
 * The endpoint trusts the client only for: event name, event_id, page
 * URL, custom data (value/currency/contentIds), and the Meta cookies.
 * The IP and user agent are always read from request headers — never
 * the body — so a malicious client can't spoof them. The hashed PII
 * (email/phone) is sourced from the signed-in Clerk session via our
 * user table, never from the request body.
 *
 * Blocklist enforcement: we sanity-check the `eventSourceUrl` here and
 * refuse to forward anything whose path is in the PHI blocklist, even
 * though the client already does the same check. Defence in depth.
 */

const ALLOWED_EVENTS = [
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
  "Lead",
  "CompleteRegistration",
] as const;

const bodySchema = z.object({
  event: z.enum(ALLOWED_EVENTS),
  event_id: z.string().min(8).max(128),
  event_source_url: z.string().url().optional(),
  fbp: z.string().max(256).optional(),
  fbc: z.string().max(256).optional(),
  custom_data: z
    .object({
      value: z.number().nonnegative().optional(),
      currency: z.string().min(3).max(3).optional(),
      content_ids: z.array(z.string().max(64)).max(50).optional(),
      content_name: z.string().max(256).optional(),
      content_category: z.string().max(128).optional(),
      content_type: z.enum(["product", "product_group"]).optional(),
      num_items: z.number().int().nonnegative().optional(),
      order_id: z.string().max(64).optional(),
    })
    .optional(),
});

// Mirror the client's pixel-allowed.ts list. Defence in depth: the client
// will not POST here for blocked routes, but if the body somehow names a
// blocked path we refuse to forward.
const BLOCKED_PATH_PREFIXES = [
  "/consultations/",
  "/account",
  "/admin",
  "/sign-in",
  "/sign-up",
  "/api/",
];

function isBlockedPath(rawUrl: string | undefined): boolean {
  if (!rawUrl) return false;
  try {
    const u = new URL(rawUrl);
    const path = u.pathname;
    return BLOCKED_PATH_PREFIXES.some((p) => path === p || path.startsWith(p));
  } catch {
    return true;
  }
}

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  if (isBlockedPath(parsed.data.event_source_url)) {
    // Silent accept — we don't want to leak the blocklist to clients,
    // and the browser is responsible for not firing here anyway.
    return NextResponse.json({ ok: true, blocked: true });
  }

  // Pull IP + UA from headers, never from the body.
  const userAgent = req.headers.get("user-agent") ?? undefined;
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined;

  // Best-effort PII from the signed-in user (server-trusted), so we never
  // accept email/phone from the request body. Failures fall back to
  // cookie-only matching, which is fine.
  let email: string | undefined;
  let phone: string | undefined;
  let externalId: string | undefined;
  try {
    const user = await getCurrentUser();
    if (user?.id) {
      externalId = user.id;
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: {
          email: true,
          customerProfile: { select: { phone: true } },
        },
      });
      email = dbUser?.email ?? undefined;
      phone = dbUser?.customerProfile?.phone ?? undefined;
    }
  } catch {
    // No session — guest visitor. Cookies + IP/UA only.
  }

  await sendCapiEvent({
    event: parsed.data.event,
    eventId: parsed.data.event_id,
    eventSourceUrl: parsed.data.event_source_url,
    actionSource: "website",
    userData: {
      email,
      phone,
      externalId,
      fbp: parsed.data.fbp,
      fbc: parsed.data.fbc,
      ip,
      userAgent,
    },
    customData: parsed.data.custom_data,
  });

  return NextResponse.json({ ok: true });
}
