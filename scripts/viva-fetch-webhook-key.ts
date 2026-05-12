/**
 * One-off bootstrap: fetch the merchant-wide Viva webhook verification Key
 * and print it.
 *
 * Run after VIVA_MERCHANT_ID + VIVA_API_KEY + VIVA_ENV are set in the
 * environment (this script does NOT need VIVA_WEBHOOK_KEY itself).
 *
 * Usage:
 *   pnpm tsx scripts/viva-fetch-webhook-key.ts
 *
 * Then paste the printed value into VIVA_WEBHOOK_KEY in Vercel/`.env` and
 * redeploy. The /api/viva/webhook GET handler echoes it back to Viva at
 * webhook URL registration so Viva can verify URL ownership.
 *
 * The Key is per-merchant, not per-environment — but because we use
 * different VIVA_ENV settings (and different merchant accounts) for demo
 * vs production, run this script once per environment with the
 * corresponding credentials.
 */

import { fetchWebhookVerificationKey } from "../src/lib/payments/viva";

async function main(): Promise<void> {
  const env = process.env.VIVA_ENV;
  if (!env) {
    console.error("VIVA_ENV is not set — set demo or production before running.");
    process.exit(1);
  }
  if (!process.env.VIVA_MERCHANT_ID || !process.env.VIVA_API_KEY) {
    console.error("VIVA_MERCHANT_ID and VIVA_API_KEY must be set.");
    process.exit(1);
  }

  // The viva client also reads VIVA_WEBHOOK_KEY through serverEnv() at boot
  // even though this code path doesn't use it — set a placeholder if it's
  // missing so env validation doesn't trip the bootstrap itself.
  if (!process.env.VIVA_WEBHOOK_KEY) {
    process.env.VIVA_WEBHOOK_KEY = "bootstrap-placeholder";
  }

  const key = await fetchWebhookVerificationKey();
  console.log("\nViva webhook verification key:\n");
  console.log(key);
  console.log(
    "\nPaste this into VIVA_WEBHOOK_KEY in your environment and redeploy.\n",
  );
}

main().catch((err) => {
  console.error("Failed to fetch webhook verification key:", err);
  process.exit(1);
});
