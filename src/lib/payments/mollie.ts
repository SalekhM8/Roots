import createMollieClient, { CaptureMethod, PaymentMethod, SequenceType } from "@mollie/api-client";
import { db } from "@/lib/db";

type MollieClient = ReturnType<typeof createMollieClient>;

let _mollie: MollieClient | null = null;

export function getMollie(): MollieClient {
  if (!_mollie) {
    const key = process.env.MOLLIE_API_KEY;
    if (!key) throw new Error("MOLLIE_API_KEY is not set");
    _mollie = createMollieClient({ apiKey: key });
  }
  return _mollie;
}

/** Convert pence (integer) to Mollie string format e.g. 1499 → "14.99" */
function toMollieAmount(minorAmount: number): string {
  return (minorAmount / 100).toFixed(2);
}

/**
 * Get or create a Mollie Customer for a registered user.
 * Stores the Mollie Customer ID on the User record for reuse.
 */
export async function getOrCreateMollieCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { mollieCustomerId: true },
  });

  if (user.mollieCustomerId) return user.mollieCustomerId;

  const mollie = getMollie();
  const customer = await mollie.customers.create({
    name: name ?? email,
    email,
    metadata: JSON.stringify({ roots_user_id: userId }),
  });

  await db.user.update({
    where: { id: userId },
    data: { mollieCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Create a Mollie payment. Returns the payment object including checkout URL.
 *
 * - Supplement orders use default capture (automatic).
 * - POM/mixed orders use captureMode: "manual" (authorize only).
 */
export async function createMolliePayment(params: {
  amountMinor: number;
  description: string;
  redirectUrl: string;
  webhookUrl?: string;
  captureMode?: "manual";
  metadata?: Record<string, string>;
  customerId?: string;
  sequenceType?: "first" | "recurring";
  mandateId?: string;
  method?: string;
}) {
  const mollie = getMollie();

  const payment = await mollie.payments.create({
    amount: { currency: "GBP", value: toMollieAmount(params.amountMinor) },
    description: params.description,
    redirectUrl: params.redirectUrl,
    ...(params.webhookUrl ? { webhookUrl: params.webhookUrl } : {}),
    metadata: params.metadata ?? null,
    ...(params.captureMode === "manual" ? { captureMode: CaptureMethod.manual } : {}),
    ...(params.customerId ? { customerId: params.customerId } : {}),
    ...(params.sequenceType ? { sequenceType: params.sequenceType as SequenceType } : {}),
    ...(params.mandateId ? { mandateId: params.mandateId } : {}),
    ...(params.method ? { method: params.method as PaymentMethod } : {}),
  });
  return payment;
}

/**
 * Capture an authorized payment (used after prescriber approval).
 */
export async function captureMolliePayment(paymentId: string) {
  const mollie = getMollie();
  return mollie.paymentCaptures.create({ paymentId });
}

/**
 * Release an authorized payment (void). Used when consultation is rejected.
 */
export async function releaseAuthorization(paymentId: string) {
  const mollie = getMollie();
  return mollie.payments.releaseAuthorization(paymentId);
}

/**
 * Cancel a payment that hasn't been captured yet.
 */
export async function cancelMolliePayment(paymentId: string) {
  const mollie = getMollie();
  return mollie.payments.cancel(paymentId);
}

/**
 * Refund a captured payment. Supports full or partial refunds.
 */
export async function refundMolliePayment(
  paymentId: string,
  amountMinor?: number
) {
  const mollie = getMollie();

  if (amountMinor) {
    return mollie.paymentRefunds.create({
      paymentId,
      amount: { currency: "GBP", value: toMollieAmount(amountMinor) },
    });
  }

  // Full refund — fetch payment amount first
  const payment = await mollie.payments.get(paymentId);
  return mollie.paymentRefunds.create({
    paymentId,
    amount: payment.amount,
  });
}

/**
 * Fetch a Mollie payment by ID. Used in webhook handler for validation.
 */
export async function getMolliePayment(paymentId: string) {
  const mollie = getMollie();
  return mollie.payments.get(paymentId);
}

/**
 * List mandates (saved payment methods) for a Mollie customer.
 */
export async function listMollieMandates(customerId: string) {
  const mollie = getMollie();
  const page = await mollie.customerMandates.page({ customerId });
  return page;
}

/**
 * Revoke a mandate (remove a saved payment method).
 */
export async function revokeMollieMandate(
  customerId: string,
  mandateId: string
) {
  const mollie = getMollie();
  return mollie.customerMandates.revoke(mandateId, { customerId });
}
