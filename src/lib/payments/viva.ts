/**
 * Viva.com payment provider client.
 *
 * Viva exposes TWO parallel auth schemes against TWO distinct hostnames per
 * environment, and we need both:
 *
 *  1. OAuth2 Bearer (Smart Checkout client_id/client_secret) → `*-api.vivapayments.com`
 *     - POST /checkout/v2/orders            (create payment order)
 *     - GET  /checkout/v2/transactions/{id} (retrieve transaction — used to
 *                                            revalidate webhook payloads)
 *
 *  2. Basic auth (Merchant ID + API Key) → `*.vivapayments.com`
 *     - POST   /api/transactions/{id}        (capture preauth)
 *     - DELETE /api/transactions/{id}        (void OR refund — same endpoint)
 *     - GET    /api/messages/config/token    (fetch webhook verification key)
 *
 * Mixing them up returns 401/404 with no helpful body. This module is the
 * single boundary that owns both clients.
 *
 * Docs: https://developer.viva.com/integration-reference/oauth2-authentication/
 *       https://developer.viva.com/tutorials/payments/handle-pre-authorizations/
 *       https://developer.viva.com/webhooks-for-payments/
 */

import { serverEnv } from "@/lib/env";
import {
  type CreateOrderRequest,
  type CreateOrderResponse,
  type RetrieveTransactionResponse,
  type TransactionMutationResponse,
  type OrderCode,
  asOrderCode,
} from "./viva-types";

// ---------- Hosts -----------------------------------------------------------

interface VivaHosts {
  /** OAuth token endpoint (the `accounts` host). */
  accounts: string;
  /** Bearer-protected v2 API host. */
  api: string;
  /** Basic-auth legacy v1 API host (also serves the redirect checkout). */
  legacy: string;
  /** Smart Checkout redirect URL the customer is sent to. */
  redirectBase: string;
}

function hosts(): VivaHosts {
  const env = serverEnv().VIVA_ENV;
  if (env === "production") {
    return {
      accounts: "https://accounts.vivapayments.com",
      api: "https://api.vivapayments.com",
      legacy: "https://www.vivapayments.com",
      redirectBase: "https://www.vivapayments.com/web/checkout",
    };
  }
  return {
    accounts: "https://demo-accounts.vivapayments.com",
    api: "https://demo-api.vivapayments.com",
    legacy: "https://demo.vivapayments.com",
    redirectBase: "https://demo.vivapayments.com/web/checkout",
  };
}

// ---------- OAuth2 token cache ---------------------------------------------

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}

let tokenCache: CachedToken | null = null;

/**
 * Fetch (or return cached) OAuth2 access token. Tokens TTL ~1 hour; we
 * refresh 60s before expiry to absorb clock skew. Single-flight isn't
 * required at this volume — duplicate requests just waste one extra call.
 */
async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token;
  }

  const env = serverEnv();
  const credentials = Buffer.from(
    `${env.VIVA_CLIENT_ID}:${env.VIVA_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(`${hosts().accounts}/connect/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new VivaError(
      `OAuth2 token fetch failed: ${response.status} ${text}`,
      response.status,
    );
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return tokenCache.token;
}

function basicAuthHeader(): string {
  const env = serverEnv();
  const credentials = Buffer.from(
    `${env.VIVA_MERCHANT_ID}:${env.VIVA_API_KEY}`,
  ).toString("base64");
  return `Basic ${credentials}`;
}

// ---------- Errors ----------------------------------------------------------

export class VivaError extends Error {
  readonly status: number;
  readonly errorCode: number | undefined;
  readonly eventId: number | undefined;
  readonly correlationId: string | undefined;

  constructor(
    message: string,
    status: number,
    extra?: { errorCode?: number; eventId?: number; correlationId?: string },
  ) {
    super(message);
    this.name = "VivaError";
    this.status = status;
    this.errorCode = extra?.errorCode;
    this.eventId = extra?.eventId;
    this.correlationId = extra?.correlationId;
  }
}

// ---------- Public API ------------------------------------------------------

/**
 * Create a Viva payment order. Returns the OrderCode (as string — see
 * viva-types.ts for the MAX_SAFE_INTEGER footgun) and the redirect URL the
 * customer should be sent to.
 *
 * `preauth: true` → authorize-only; capture must follow.
 * `preauth: false` → standard charge, captured immediately on the redirect.
 */
export async function createOrder(
  params: CreateOrderRequest,
): Promise<{ orderCode: OrderCode; redirectUrl: string }> {
  const token = await getAccessToken();

  const body: Record<string, unknown> = {
    amount: params.amount,
    preauth: params.preauth,
    sourceCode: params.sourceCode,
    merchantTrns: params.merchantTrns,
    customerTrns: params.customerTrns,
    customer: params.customer,
  };
  if (params.paymentTimeout !== undefined) body.paymentTimeout = params.paymentTimeout;
  if (params.tags !== undefined) body.tags = params.tags;

  const response = await fetch(`${hosts().api}/checkout/v2/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const correlationId = response.headers.get("X-Viva-CorrelationId") ?? undefined;
  const text = await response.text();

  if (!response.ok) {
    throw new VivaError(
      `createOrder failed: ${response.status} ${text}`,
      response.status,
      { correlationId },
    );
  }

  // Defensive parse — Viva responses occasionally arrive in either of two
  // shapes. We accept lowercase `orderCode` (current OAuth2 v2) AND uppercase
  // `OrderCode` (some legacy paths).
  const data = JSON.parse(text) as { orderCode?: number | string; OrderCode?: number | string };
  const raw = data.orderCode ?? data.OrderCode;
  if (raw === undefined || raw === null) {
    throw new VivaError(
      `createOrder returned no orderCode: ${text}`,
      response.status,
      { correlationId },
    );
  }

  // Coerce to string immediately. Viva OrderCodes are 16-digit longs that
  // exceed JS Number.MAX_SAFE_INTEGER — never round-trip through Number.
  const orderCode = asOrderCode(String(raw));
  const redirectUrl = `${hosts().redirectBase}?ref=${orderCode}`;

  return { orderCode, redirectUrl };
}

/**
 * Retrieve a transaction by its TransactionId. Used inside the webhook
 * handler to revalidate inbound payloads — Viva does not sign webhook bodies,
 * so the documented security model is "always re-fetch before mutating".
 */
export async function retrieveTransaction(
  transactionId: string,
): Promise<RetrieveTransactionResponse> {
  const token = await getAccessToken();

  const response = await fetch(
    `${hosts().api}/checkout/v2/transactions/${encodeURIComponent(transactionId)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  const correlationId = response.headers.get("X-Viva-CorrelationId") ?? undefined;
  const text = await response.text();

  if (!response.ok) {
    throw new VivaError(
      `retrieveTransaction failed: ${response.status} ${text}`,
      response.status,
      { correlationId },
    );
  }

  // Viva returns the transaction wrapped in a `transactions` array with a
  // single element OR as a bare object — normalise to the bare shape and
  // coerce OrderCode to string.
  const parsed = JSON.parse(text) as Record<string, unknown> & {
    transactions?: Record<string, unknown>[];
  };
  const t = parsed.transactions?.[0] ?? parsed;

  return {
    transactionId: String(t.transactionId ?? t.TransactionId),
    orderCode: asOrderCode(String(t.orderCode ?? t.OrderCode)),
    statusId: (t.statusId ?? t.StatusId) as RetrieveTransactionResponse["statusId"],
    amount: Number(t.amount ?? t.Amount),
    currencyCode: String(t.currencyCode ?? t.CurrencyCode ?? ""),
    merchantTrns: (t.merchantTrns ?? t.MerchantTrns ?? null) as string | null,
    customerTrns: (t.customerTrns ?? t.CustomerTrns ?? null) as string | null,
    cardNumber: (t.cardNumber ?? t.CardNumber ?? null) as string | null,
    cardToken: (t.cardToken ?? t.CardToken ?? null) as string | null,
    cardCountryCode: (t.cardCountryCode ?? t.CardCountryCode ?? null) as string | null,
    transactionTypeId: (t.transactionTypeId ??
      t.TransactionTypeId) as RetrieveTransactionResponse["transactionTypeId"],
    insDate: String(t.insDate ?? t.InsDate ?? ""),
  };
}

/**
 * Capture a previously-authorized transaction. Amount in MINOR units (pence).
 *
 * NOTE: Viva treats capture/void/refund as single-shot per preauth by default.
 * The hold is released after one capture (full or partial). Multi-capture
 * requires Viva account-manager enablement.
 */
export async function captureTransaction(
  transactionId: string,
  amountMinor: number,
  customerTrns?: string,
): Promise<TransactionMutationResponse> {
  const response = await fetch(
    `${hosts().legacy}/api/transactions/${encodeURIComponent(transactionId)}`,
    {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountMinor,
        customerTrns: customerTrns ?? "",
        currencyCode: "826", // GBP
      }),
    },
  );

  return parseMutationResponse(response, "captureTransaction");
}

/**
 * Cancel/void OR refund a transaction. Viva uses the same DELETE endpoint
 * for both — the provider decides cancel-vs-refund based on whether the
 * underlying card transaction has cleared yet.
 *
 * Pass `amountMinor` to constrain partial; omit (or pass full amount) for
 * a complete reversal.
 */
export async function voidOrRefundTransaction(
  transactionId: string,
  amountMinor: number,
): Promise<TransactionMutationResponse> {
  const env = serverEnv();
  const url = new URL(
    `${hosts().legacy}/api/transactions/${encodeURIComponent(transactionId)}`,
  );
  url.searchParams.set("amount", String(amountMinor));
  url.searchParams.set("sourceCode", env.VIVA_SOURCE_CODE);

  const response = await fetch(url.toString(), {
    method: "DELETE",
    headers: { Authorization: basicAuthHeader() },
  });

  return parseMutationResponse(response, "voidOrRefundTransaction");
}

/**
 * Fetch the merchant's webhook verification key. Run once during setup; the
 * value is then pinned in the VIVA_WEBHOOK_KEY env var and echoed by our
 * webhook GET handler so Viva can verify URL ownership at registration.
 *
 * Source: https://developer.viva.com/webhooks-for-payments/
 */
export async function fetchWebhookVerificationKey(): Promise<string> {
  const response = await fetch(`${hosts().legacy}/api/messages/config/token`, {
    method: "GET",
    headers: { Authorization: basicAuthHeader() },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new VivaError(
      `fetchWebhookVerificationKey failed: ${response.status} ${text}`,
      response.status,
    );
  }

  const data = (await response.json()) as { Key?: string };
  if (!data.Key) {
    throw new VivaError("fetchWebhookVerificationKey: response missing Key", 500);
  }
  return data.Key;
}

// ---------- Internals -------------------------------------------------------

async function parseMutationResponse(
  response: Response,
  op: string,
): Promise<TransactionMutationResponse> {
  const correlationId = response.headers.get("X-Viva-CorrelationId") ?? undefined;
  const text = await response.text();

  // The legacy v1 endpoints return a 200 with Success: false on logical
  // failures (e.g. preauth already captured, refund > original). They reserve
  // 4xx/5xx for transport-level errors. We surface both as VivaError with
  // the documented EventId/ErrorCode preserved for downstream handling.
  let parsed: TransactionMutationResponse;
  try {
    parsed = JSON.parse(text) as TransactionMutationResponse;
  } catch {
    throw new VivaError(
      `${op} returned non-JSON: ${response.status} ${text}`,
      response.status,
      { correlationId },
    );
  }

  if (!response.ok) {
    throw new VivaError(
      `${op} HTTP ${response.status}: ${parsed.ErrorText ?? text}`,
      response.status,
      {
        errorCode: parsed.ErrorCode,
        eventId: parsed.EventId,
        correlationId,
      },
    );
  }

  if (!parsed.Success) {
    throw new VivaError(
      `${op} failed: ${parsed.ErrorText ?? "unknown error"}`,
      response.status,
      {
        errorCode: parsed.ErrorCode,
        eventId: parsed.EventId,
        correlationId,
      },
    );
  }

  return parsed;
}
