/**
 * Viva.com payment service layer.
 *
 * The boundary between routes/checkout actions and the raw Viva HTTP client
 * (`src/lib/payments/viva.ts`). Owns:
 *
 *   1. Creating a payment order and persisting a Payment row with the Viva
 *      identifiers we need for later state mutations.
 *   2. Capturing / voiding / refunding a previously authorized transaction
 *      (called by the prescriber approve/reject path and admin refunds).
 *   3. Processing inbound webhook envelopes — dedupe → retrieve → mutate.
 *   4. Processing the customer redirect-back from Smart Checkout — used as
 *      the primary signal for cancelled and 3DS-failed flows since Viva does
 *      not webhook those events.
 *
 * Idempotency strategy:
 *   - Viva has no native idempotency keys. We generate a UUID (`merchantTrns`)
 *     per Payment row at creation and pass it on every Viva call. The unique
 *     `(provider, messageId)` constraint on `webhook_events` provides
 *     receive-side dedupe.
 */

import { randomUUID } from "node:crypto";

import { db } from "@/lib/db";
import { serverEnv } from "@/lib/env";
import { writeAuditLog } from "@/lib/security/audit";
import {
  captureTransaction,
  createOrder,
  retrieveTransaction,
  voidOrRefundTransaction,
  VivaError,
} from "@/lib/payments/viva";
import {
  type RetrieveTransactionResponse,
  type TransactionEventData,
  VivaCurrency,
  VivaEventType,
  type VivaEventTypeId,
  VivaTransactionType,
} from "@/lib/payments/viva-types";
import { inngest } from "@/server/workflows/inngest";
import { markUserActiveCartsConverted } from "@/server/services/cart";

// ---------- Types -----------------------------------------------------------

export interface CreateVivaPaymentParams {
  orderId: string;
  amountMinor: number;
  /**
   * `true` for POM/mixed orders (authorize, capture later on prescriber
   * approval). `false` for supplement-only (auto-capture on redirect).
   */
  preauth: boolean;
  customer: {
    email?: string;
    fullName?: string;
    phone?: string;
  };
  /** Free-form description shown on the Viva checkout page. */
  description: string;
  /** Optional searchable tags for Viva self-care. */
  tags?: string[];
}

export interface CreateVivaPaymentResult {
  paymentId: string;
  vivaOrderCode: string;
  redirectUrl: string;
}

// ---------- Public API ------------------------------------------------------

/**
 * Create a Viva payment order for an existing Order row, persist the Payment
 * record, and return the redirect URL the customer should be sent to.
 *
 * Caller must have already created the Order. This function does NOT mutate
 * order state on its own — the webhook / return handlers do that based on
 * the verified Viva-side state.
 */
export async function createVivaPayment(
  params: CreateVivaPaymentParams,
): Promise<CreateVivaPaymentResult> {
  const env = serverEnv();
  const merchantTrns = randomUUID();

  // Issue the Viva order BEFORE writing the Payment row. If Viva fails we
  // never end up with an orphan pending Payment row pointing at no provider
  // resource. Conversely, if the DB insert fails after Viva succeeds, the
  // OrderCode is recoverable from logs/correlation id and a follow-up
  // reconciliation can re-attach.
  const { orderCode, redirectUrl } = await createOrder({
    amount: params.amountMinor,
    preauth: params.preauth,
    sourceCode: env.VIVA_SOURCE_CODE,
    merchantTrns,
    customerTrns: params.description.slice(0, 255),
    customer: {
      // Email intentionally omitted — Viva sends its own customer confirmation
      // email when one is provided, which duplicates our Resend transactional
      // email and confuses customers. Our DB already carries the email on the
      // Order row, so we lose nothing operationally.
      fullName: params.customer.fullName,
      phone: params.customer.phone,
      countryCode: "GB",
      requestLang: "en-GB",
    },
    paymentTimeout: 1800, // 30 min — Viva default
    tags: params.tags,
  });

  const payment = await db.payment.create({
    data: {
      orderId: params.orderId,
      provider: "viva",
      vivaOrderCode: orderCode,
      merchantTrns,
      status: "pending",
      amountMinor: params.amountMinor,
      currency: "GBP",
      idempotencyKey: merchantTrns,
    },
    select: { id: true },
  });

  await writeAuditLog({
    actorRole: "system",
    entityType: "Payment",
    entityId: payment.id,
    action: "payment.created",
    newState: {
      provider: "viva",
      vivaOrderCode: orderCode,
      amountMinor: params.amountMinor,
      preauth: params.preauth,
    },
  });

  return { paymentId: payment.id, vivaOrderCode: orderCode, redirectUrl };
}

/**
 * Capture a previously authorized Viva preauth. Called from the prescriber
 * approve action.
 *
 * Webhook 1796 (capture posted) will subsequently arrive — `processVivaWebhook`
 * is written to no-op when status is already `captured` so the double-update
 * is harmless.
 */
export async function captureVivaPayment(paymentId: string): Promise<void> {
  const payment = await db.payment.findUniqueOrThrow({
    where: { id: paymentId },
    select: {
      id: true,
      status: true,
      amountMinor: true,
      vivaTransactionId: true,
      vivaOrderCode: true,
      orderId: true,
      order: { select: { orderNumber: true, orderType: true, userId: true } },
    },
  });

  if (payment.status !== "authorized") {
    throw new Error(
      `captureVivaPayment: payment ${paymentId} is ${payment.status}, expected authorized`,
    );
  }
  if (!payment.vivaTransactionId) {
    throw new Error(
      `captureVivaPayment: payment ${paymentId} has no vivaTransactionId — cannot capture before the preauth webhook has landed`,
    );
  }

  const result = await captureTransaction(
    payment.vivaTransactionId,
    payment.amountMinor,
    `roots-capture-${payment.order.orderNumber}`,
  );

  // Defensive: Viva returns Success: false in-band for logical errors and
  // the client throws on those. If we got here the capture was accepted.
  // Mark captured immediately rather than waiting on the webhook so the
  // prescriber UI flips state synchronously.
  const now = new Date();
  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "captured", capturedAt: now },
    });
    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: "captured",
        fulfillmentStatus: "ready_to_pack",
      },
    });
    await tx.fulfillmentJob.upsert({
      where: { orderId: payment.orderId },
      create: { orderId: payment.orderId },
      update: {},
    });
  });

  await writeAuditLog({
    actorRole: "system",
    entityType: "Payment",
    entityId: payment.id,
    action: "payment.captured",
    newState: {
      provider: "viva",
      vivaTransactionId: payment.vivaTransactionId,
      newCaptureTransactionId: result.TransactionId ?? null,
      amountMinor: payment.amountMinor,
    },
  });

  await inngest.send({
    name: "payment/captured",
    data: {
      userId: payment.order.userId,
      orderId: payment.orderId,
      amountMinor: payment.amountMinor,
      orderNumber: payment.order.orderNumber,
    },
  });
}

/**
 * Void or refund a Viva transaction. Viva uses the same DELETE endpoint for
 * both — the API decides cancel-vs-refund based on whether the underlying
 * card transaction has cleared. We expose one function with the same shape
 * and let callers reason about it via `payment.status`:
 *
 *   - status `authorized` → DELETE acts as a void (no funds were captured).
 *   - status `captured`   → DELETE acts as a refund (full or partial).
 *
 * Called from prescriber reject (full void) and admin refund actions.
 */
export async function voidOrRefundVivaPayment(params: {
  paymentId: string;
  amountMinor?: number;
  /** Reason for the audit log — required for refunds, optional for voids. */
  reason?: string;
}): Promise<void> {
  const payment = await db.payment.findUniqueOrThrow({
    where: { id: params.paymentId },
    select: {
      id: true,
      status: true,
      amountMinor: true,
      vivaTransactionId: true,
      orderId: true,
      order: { select: { orderNumber: true } },
    },
  });

  if (!payment.vivaTransactionId) {
    throw new Error(
      `voidOrRefundVivaPayment: payment ${params.paymentId} has no vivaTransactionId`,
    );
  }

  const isVoid = payment.status === "authorized";
  const isRefund = payment.status === "captured";
  if (!isVoid && !isRefund) {
    throw new Error(
      `voidOrRefundVivaPayment: payment ${params.paymentId} is ${payment.status}; only authorized or captured payments can be reversed`,
    );
  }

  const amount = params.amountMinor ?? payment.amountMinor;
  await voidOrRefundTransaction(payment.vivaTransactionId, amount);

  const now = new Date();
  const isFullReversal = amount === payment.amountMinor;
  const newStatus = isVoid
    ? "voided"
    : isFullReversal
      ? "refunded"
      : "captured"; // partial refund leaves the payment captured

  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        ...(isVoid ? { voidedAt: now } : {}),
        ...(isRefund && isFullReversal ? { refundedAt: now } : {}),
      },
    });
    if (isVoid) {
      await tx.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "voided" },
      });
    } else if (isFullReversal) {
      await tx.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "refunded" },
      });
    }
  });

  await writeAuditLog({
    actorRole: "system",
    entityType: "Payment",
    entityId: payment.id,
    action: isVoid ? "payment.voided" : "payment.refunded",
    newState: {
      provider: "viva",
      vivaTransactionId: payment.vivaTransactionId,
      amountMinor: amount,
      reason: params.reason ?? null,
    },
  });
}

// ---------- Webhook processing ---------------------------------------------

export interface VivaWebhookEnvelopeInput {
  messageId: string;
  eventTypeId: VivaEventTypeId;
  eventData: TransactionEventData;
  rawPayload: unknown;
}

/**
 * Process a single Viva webhook delivery.
 *
 * Caller (route handler) is responsible for:
 *   - IP allowlist verification
 *   - Inserting the WebhookEvent row first (unique constraint ensures
 *     dedupe — call this function only on a successful insert)
 *   - Returning 200 to Viva regardless of processing outcome (Viva treats
 *     non-2xx as failure and retries up to 24 times)
 *
 * This function calls `retrieveTransaction` to revalidate the payload — per
 * Viva's documented webhook security model, NEVER trust the webhook body
 * alone.
 */
export async function processVivaWebhook(
  envelope: VivaWebhookEnvelopeInput,
): Promise<void> {
  const { eventTypeId, eventData } = envelope;

  // OrderUpdated (4865) carries no transaction — log and exit. We use the
  // return URL for the cases this event implies (cancelled / 3DS-failed).
  if (eventTypeId === VivaEventType.OrderUpdated) {
    return;
  }

  const transactionId = eventData.TransactionId;
  if (!transactionId) {
    console.warn("[viva-webhook] envelope missing TransactionId", envelope);
    return;
  }

  // Revalidate via API. If this fails, throw — the webhook receiver will
  // log and still 200 (since we already inserted WebhookEvent), but the
  // caller knows to retry on the next redelivery. Note: Viva retries 24x
  // hourly so a transient API failure here is recoverable.
  const tx = await retrieveTransaction(transactionId);

  // Currency assertion — defense-in-depth for source-code misconfig that
  // would otherwise silently process a non-GBP transaction at the wrong
  // pence amount. We only sell GBP today.
  if (tx.currencyCode && tx.currencyCode !== VivaCurrency.GBP) {
    console.error("[viva-webhook] non-GBP transaction — refusing to process", {
      transactionId: tx.transactionId,
      orderCode: tx.orderCode,
      currencyCode: tx.currencyCode,
    });
    return;
  }

  // Find the Payment row by the OrderCode that came in on the envelope.
  // OrderCode arrives as a JSON number in EventData but exceeds
  // MAX_SAFE_INTEGER — we re-pull the canonical string form from the
  // retrieve response.
  const payment = await db.payment.findFirst({
    where: { vivaOrderCode: tx.orderCode },
    select: {
      id: true,
      status: true,
      amountMinor: true,
      vivaTransactionId: true,
      orderId: true,
      order: {
        select: {
          id: true,
          orderType: true,
          orderNumber: true,
          userId: true,
        },
      },
    },
  });

  if (!payment) {
    console.warn("[viva-webhook] no matching payment for OrderCode", tx.orderCode);
    return;
  }

  switch (eventTypeId) {
    case VivaEventType.TransactionPaymentCreated:
      await handlePaymentCreated(payment, tx);
      break;
    case VivaEventType.TransactionFailed:
      await handleTransactionFailed(payment, tx);
      break;
    case VivaEventType.TransactionReversalCreated:
      await handleReversal(payment, tx);
      break;
  }
}

type PaymentRow = {
  id: string;
  status: string;
  amountMinor: number;
  vivaTransactionId: string | null;
  orderId: string;
  order: {
    id: string;
    orderType: string;
    orderNumber: string;
    userId: string | null;
  };
};

/**
 * Event 1796 — TransactionPaymentCreated. Fires for:
 *   - successful preauth (TransactionTypeId 1) → status `authorized`
 *   - successful charge   (TransactionTypeId 5) → status `captured`
 *   - successful capture  (TransactionTypeId 0) → status `captured`
 *
 * StatusId we expect: F (Finished) for charges, A (Active) for preauths
 * pending capture, C (Captured) once the original preauth is captured.
 */
async function handlePaymentCreated(
  payment: PaymentRow,
  tx: RetrieveTransactionResponse,
): Promise<void> {
  // Idempotency: if we've already moved past pending/authorized for this
  // event type, do nothing. captureVivaPayment may have synchronously
  // marked captured before this webhook arrived.
  if (payment.status === "captured" || payment.status === "voided" || payment.status === "refunded") {
    return;
  }

  const isPreauth = tx.transactionTypeId === VivaTransactionType.CardPreauth;
  const isChargeOrCapture =
    tx.transactionTypeId === VivaTransactionType.CardCharge ||
    tx.transactionTypeId === VivaTransactionType.CardCapture;

  if (isPreauth) {
    if (payment.status !== "pending") return;
    const now = new Date();
    // Conservative capture window: 5 days for debit (issuer-controlled).
    // We re-check via the sweeper cron but pin the lower bound here.
    const captureBefore = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    await db.$transaction(async (txn) => {
      await txn.payment.update({
        where: { id: payment.id },
        data: {
          status: "authorized",
          authorizedAt: now,
          captureBefore,
          vivaTransactionId: tx.transactionId,
        },
      });
      await txn.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "authorized" },
      });
    });

    await writeAuditLog({
      actorRole: "system",
      entityType: "Payment",
      entityId: payment.id,
      action: "payment.authorized",
      newState: {
        provider: "viva",
        vivaTransactionId: tx.transactionId,
        amountMinor: tx.amount,
        captureBefore: captureBefore.toISOString(),
      },
    });

    // Convert the customer's active cart now that payment is locked in.
    await markUserActiveCartsConverted(payment.order.userId);
    return;
  }

  if (isChargeOrCapture) {
    const wasAuthorized = payment.status === "authorized";
    const now = new Date();
    await db.$transaction(async (txn) => {
      await txn.payment.update({
        where: { id: payment.id },
        data: {
          status: "captured",
          capturedAt: now,
          ...(!wasAuthorized
            ? { authorizedAt: now, vivaTransactionId: tx.transactionId }
            : {}),
        },
      });
      await txn.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "captured",
          ...(!wasAuthorized ? { fulfillmentStatus: "ready_to_pack" } : {}),
        },
      });
      if (!wasAuthorized) {
        await txn.fulfillmentJob.upsert({
          where: { orderId: payment.orderId },
          create: { orderId: payment.orderId },
          update: {},
        });
      }
    });

    await writeAuditLog({
      actorRole: "system",
      entityType: "Payment",
      entityId: payment.id,
      action: "payment.captured",
      newState: {
        provider: "viva",
        vivaTransactionId: tx.transactionId,
        amountMinor: tx.amount,
        viaWebhook: true,
      },
    });

    // Convert the customer's active cart on the synchronous-charge path
    // (supplement-only orders that capture immediately). Idempotent w.r.t.
    // the preauth branch above for orders that came via authorize→capture.
    await markUserActiveCartsConverted(payment.order.userId);

    if (!wasAuthorized) {
      await inngest.send({
        name: "payment/captured",
        data: {
          userId: payment.order.userId,
          orderId: payment.orderId,
          amountMinor: payment.amountMinor,
          orderNumber: payment.order.orderNumber,
        },
      });
    }
  }
}

/** Event 1798 — TransactionFailed. */
async function handleTransactionFailed(
  payment: PaymentRow,
  _tx: RetrieveTransactionResponse,
): Promise<void> {
  if (payment.status !== "pending") return;

  await db.$transaction(async (txn) => {
    await txn.payment.update({
      where: { id: payment.id },
      data: { status: "failed" },
    });
    await txn.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: "failed" },
    });
  });

  await writeAuditLog({
    actorRole: "system",
    entityType: "Payment",
    entityId: payment.id,
    action: "payment.failed",
    newState: { provider: "viva" },
  });
}

/** Event 1797 — TransactionReversalCreated. Refund or void executed. */
async function handleReversal(
  payment: PaymentRow,
  tx: RetrieveTransactionResponse,
): Promise<void> {
  // captureVivaPayment / voidOrRefundVivaPayment update the row
  // synchronously, so most of the time we'll arrive here with the row
  // already in its terminal state. No-op.
  if (payment.status === "voided" || payment.status === "refunded") return;

  const isFullAmount = tx.amount >= payment.amountMinor;
  const wasAuthorized = payment.status === "authorized";
  const now = new Date();

  await db.$transaction(async (txn) => {
    await txn.payment.update({
      where: { id: payment.id },
      data: {
        status: wasAuthorized ? "voided" : isFullAmount ? "refunded" : "captured",
        ...(wasAuthorized ? { voidedAt: now } : {}),
        ...(!wasAuthorized && isFullAmount ? { refundedAt: now } : {}),
      },
    });
    if (wasAuthorized) {
      await txn.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "voided" },
      });
    } else if (isFullAmount) {
      await txn.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "refunded" },
      });
    }
  });

  await writeAuditLog({
    actorRole: "system",
    entityType: "Payment",
    entityId: payment.id,
    action: wasAuthorized ? "payment.voided" : "payment.refunded",
    newState: {
      provider: "viva",
      amountMinor: tx.amount,
      viaWebhook: true,
    },
  });
}

// ---------- Return-URL handling --------------------------------------------

export interface ProcessVivaReturnParams {
  /** Viva passes `t` (transactionId) on success and on most failure modes. */
  transactionId?: string;
  /** Viva passes `eventId` (numeric) on failures — the rejection reason. */
  eventId?: string;
}

export interface ProcessVivaReturnResult {
  outcome: "success" | "failure" | "unknown";
  paymentId: string | null;
  orderId: string | null;
}

/**
 * Process the customer's redirect-back from Smart Checkout.
 *
 * This is the PRIMARY signal for cancelled / 3DS-failed flows because Viva
 * does NOT emit a webhook for those. The success path is also handled here
 * for UX (so the confirmation page renders immediately) but the canonical
 * state mutation comes from the 1796 webhook arriving later.
 *
 * Currency code 826 (GBP) is asserted to catch source-code misconfig early.
 */
export async function processVivaReturn(
  params: ProcessVivaReturnParams,
): Promise<ProcessVivaReturnResult> {
  if (!params.transactionId) {
    return { outcome: "unknown", paymentId: null, orderId: null };
  }

  let tx: RetrieveTransactionResponse;
  try {
    tx = await retrieveTransaction(params.transactionId);
  } catch (err) {
    if (err instanceof VivaError) {
      console.warn("[viva-return] retrieveTransaction failed", {
        status: err.status,
        correlationId: err.correlationId,
      });
    }
    return { outcome: "unknown", paymentId: null, orderId: null };
  }

  if (tx.currencyCode && tx.currencyCode !== VivaCurrency.GBP) {
    console.error("[viva-return] non-GBP currency on transaction", {
      transactionId: tx.transactionId,
      currencyCode: tx.currencyCode,
    });
  }

  const payment = await db.payment.findFirst({
    where: { vivaOrderCode: tx.orderCode },
    select: {
      id: true,
      orderId: true,
      status: true,
      order: { select: { userId: true } },
    },
  });
  if (!payment) {
    return { outcome: "unknown", paymentId: null, orderId: null };
  }

  // StatusId F (Finished) and C (Captured) and A (Active) all indicate
  // the customer's interaction succeeded — webhook will handle state.
  if (tx.statusId === "F" || tx.statusId === "C" || tx.statusId === "A") {
    // Convert the cart immediately so the confirmation page (and any retry
    // path) sees a clean post-checkout state without waiting for the 1796
    // webhook. Idempotent w.r.t. the webhook handler.
    await markUserActiveCartsConverted(payment.order.userId);
    return {
      outcome: "success",
      paymentId: payment.id,
      orderId: payment.orderId,
    };
  }

  // E (Error) or X (Cancelled) → mark failed if still pending. No webhook
  // is coming for these.
  if ((tx.statusId === "E" || tx.statusId === "X") && payment.status === "pending") {
    await db.$transaction(async (txn) => {
      await txn.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });
      await txn.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "failed" },
      });
    });
    await writeAuditLog({
      actorRole: "system",
      entityType: "Payment",
      entityId: payment.id,
      action: "payment.failed",
      newState: {
        provider: "viva",
        statusId: tx.statusId,
        eventId: params.eventId ?? null,
        viaReturnUrl: true,
      },
    });
    return {
      outcome: "failure",
      paymentId: payment.id,
      orderId: payment.orderId,
    };
  }

  // Anything else (M/MA/MI/ML/MW/MS dispute states, R refunded, etc.) on
  // a return URL means the customer's bounce-back doesn't map to a clean
  // success/failure. Hand off to the confirmation page; the webhook owns
  // the canonical state.
  return {
    outcome: "unknown",
    paymentId: payment.id,
    orderId: payment.orderId,
  };
}
