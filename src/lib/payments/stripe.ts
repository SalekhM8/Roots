import Stripe from "stripe";
import { db } from "@/lib/db";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

/**
 * Get or create a Stripe Customer for a registered user.
 * Stores the Stripe Customer ID on the User record for reuse.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user.stripeCustomerId) return user.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email,
    metadata: { roots_user_id: userId },
  });

  await db.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * List saved payment methods for a Stripe Customer.
 */
export async function listSavedPaymentMethods(
  stripeCustomerId: string
): Promise<Stripe.PaymentMethod[]> {
  const stripe = getStripe();
  const methods = await stripe.paymentMethods.list({
    customer: stripeCustomerId,
    type: "card",
  });
  return methods.data;
}

/**
 * Detach a payment method so it's no longer saved.
 */
export async function detachPaymentMethod(
  paymentMethodId: string
): Promise<void> {
  const stripe = getStripe();
  await stripe.paymentMethods.detach(paymentMethodId);
}

export async function createPaymentIntent(params: {
  amountMinor: number;
  currency?: string;
  captureMethod: "automatic" | "manual";
  metadata?: Record<string, string>;
  idempotencyKey: string;
  customer?: string;
  setupFutureUsage?: "off_session";
}) {
  const stripe = getStripe();
  return stripe.paymentIntents.create(
    {
      amount: params.amountMinor,
      currency: params.currency ?? "gbp",
      capture_method: params.captureMethod,
      payment_method_types: ["card"],
      metadata: params.metadata,
      ...(params.customer && { customer: params.customer }),
      ...(params.setupFutureUsage && {
        setup_future_usage: params.setupFutureUsage,
      }),
    },
    { idempotencyKey: params.idempotencyKey }
  );
}

export async function capturePaymentIntent(
  paymentIntentId: string,
  idempotencyKey: string
) {
  const stripe = getStripe();
  return stripe.paymentIntents.capture(
    paymentIntentId,
    {},
    { idempotencyKey }
  );
}

export async function voidPaymentIntent(
  paymentIntentId: string,
  idempotencyKey: string
) {
  const stripe = getStripe();
  return stripe.paymentIntents.cancel(
    paymentIntentId,
    {},
    { idempotencyKey }
  );
}

/**
 * Refund a captured payment. Supports full or partial refunds.
 * Returns the Stripe Refund object.
 */
export async function refundPayment(
  paymentIntentId: string,
  amountMinor?: number,
  idempotencyKey?: string
) {
  const stripe = getStripe();
  return stripe.refunds.create(
    {
      payment_intent: paymentIntentId,
      ...(amountMinor && { amount: amountMinor }),
    },
    idempotencyKey ? { idempotencyKey } : undefined
  );
}
