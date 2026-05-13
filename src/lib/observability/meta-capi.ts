import { createHash } from "node:crypto";
import { serverEnv } from "@/lib/env";

/**
 * Meta Conversions API (CAPI) — server-side complement to the browser
 * Pixel. The browser fires `fbq("track", ...)` with an `eventID`; the
 * server fires the same event with the same `event_id`. Meta dedupes
 * across the two so we get one logical conversion that survives
 * ad-blockers, iOS ITP, and Safari intelligent tracking prevention.
 *
 * Why server-side at all:
 *   - Roughly doubles Meta's attribution recall vs browser-only.
 *   - Required for accurate iOS reporting since 14.5.
 *   - Sees events from users with content blockers installed.
 *
 * No-op posture:
 *   - When META_PIXEL_ID or META_CAPI_ACCESS_TOKEN is missing we log a
 *     warning once and return early. The browser pixel keeps firing as
 *     normal — only the server-side echo is disabled. This means new
 *     environments deploy cleanly without secrets, and we flip CAPI on
 *     by setting the two vars.
 */

const GRAPH_API_VERSION = "v18.0";

type SupportedEvent =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead"
  | "CompleteRegistration";

export interface CapiCustomData {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_category?: string;
  content_type?: "product" | "product_group";
  num_items?: number;
  order_id?: string;
}

export interface CapiUserData {
  /** Plaintext email — will be SHA-256 hashed before send. Never logged. */
  email?: string;
  /** Plaintext phone (E.164 ideally). Will be SHA-256 hashed before send. */
  phone?: string;
  /** Meta browser cookie `_fbp`. Pass through verbatim from the client. */
  fbp?: string;
  /** Meta click cookie `_fbc`. Pass through verbatim from the client. */
  fbc?: string;
  /** Caller's IP — pull from request headers, never from the body. */
  ip?: string;
  /** Caller's user agent — pull from request headers, never from the body. */
  userAgent?: string;
  /** Optional external ID (e.g. user.id). Will be SHA-256 hashed. */
  externalId?: string;
}

export interface CapiEvent {
  event: SupportedEvent;
  /** Shared with the browser event for dedup. Must match exactly. */
  eventId: string;
  /** Unix seconds. Defaults to now. */
  eventTime?: number;
  /** Page the event happened on. NEVER pass a URL containing PHI. */
  eventSourceUrl?: string;
  /** Action source — almost always "website". */
  actionSource?: "website" | "email" | "app" | "phone_call" | "chat" | "physical_store" | "system_generated" | "other";
  userData: CapiUserData;
  customData?: CapiCustomData;
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalisePhone(phone: string): string {
  // Meta wants digits only, no leading +, no spaces, no dashes.
  return phone.replace(/[^0-9]/g, "");
}

let warnedMissingConfig = false;

interface ResolvedConfig {
  pixelId: string;
  accessToken: string;
  testEventCode?: string;
}

function getConfig(): ResolvedConfig | null {
  const env = serverEnv();
  if (!env.META_PIXEL_ID || !env.META_CAPI_ACCESS_TOKEN) {
    if (!warnedMissingConfig) {
      warnedMissingConfig = true;
      console.warn(
        "[meta-capi] META_PIXEL_ID and/or META_CAPI_ACCESS_TOKEN not set — server-side events disabled. Browser pixel still active.",
      );
    }
    return null;
  }
  return {
    pixelId: env.META_PIXEL_ID,
    accessToken: env.META_CAPI_ACCESS_TOKEN,
    testEventCode: env.META_CAPI_TEST_EVENT_CODE,
  };
}

/**
 * Send one event to Meta CAPI. Resolves on completion (success or
 * failure) — never throws, so callers don't need try/catch at every
 * site. Failures are logged but do not surface to the user.
 *
 * Designed to be fire-and-forget from a route handler: callers should
 * `void sendCapiEvent(...)` if they don't need the result.
 */
export async function sendCapiEvent(payload: CapiEvent): Promise<void> {
  const config = getConfig();
  if (!config) return;

  const user: Record<string, string | string[]> = {};
  if (payload.userData.email) user.em = [sha256(normaliseEmail(payload.userData.email))];
  if (payload.userData.phone) user.ph = [sha256(normalisePhone(payload.userData.phone))];
  if (payload.userData.externalId) user.external_id = [sha256(payload.userData.externalId)];
  if (payload.userData.fbp) user.fbp = payload.userData.fbp;
  if (payload.userData.fbc) user.fbc = payload.userData.fbc;
  if (payload.userData.ip) user.client_ip_address = payload.userData.ip;
  if (payload.userData.userAgent) user.client_user_agent = payload.userData.userAgent;

  const data: Record<string, unknown> = {
    event_name: payload.event,
    event_time: payload.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: payload.eventId,
    action_source: payload.actionSource ?? "website",
    user_data: user,
  };
  if (payload.eventSourceUrl) data.event_source_url = payload.eventSourceUrl;
  if (payload.customData && Object.keys(payload.customData).length > 0) {
    data.custom_data = payload.customData;
  }

  const body: Record<string, unknown> = { data: [data] };
  if (config.testEventCode) body.test_event_code = config.testEventCode;

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${config.pixelId}/events?access_token=${config.accessToken}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[meta-capi] ${payload.event} failed`, res.status, text.slice(0, 500));
    }
  } catch (err) {
    console.error(`[meta-capi] ${payload.event} threw`, err);
  }
}
