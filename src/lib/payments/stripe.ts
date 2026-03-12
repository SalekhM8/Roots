import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export async function createPaymentIntent(params: {
  amountMinor: number;
  currency?: string;
  captureMethod: "automatic" | "manual";
  metadata?: Record<string, string>;
  idempotencyKey: string;
}) {
  const stripe = getStripe();
  return stripe.paymentIntents.create(
    {
      amount: params.amountMinor,
      currency: params.currency ?? "gbp",
      capture_method: params.captureMethod,
      payment_method_types: ["card"],
      metadata: params.metadata,
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
