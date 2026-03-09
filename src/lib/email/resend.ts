import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "ROOTS Pharmacy <noreply@rootspharmacy.co.uk>";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send a transactional email via Resend.
 * Returns the provider message ID for traceability.
 */
export async function sendEmail(
  payload: EmailPayload
): Promise<{ messageId: string | null }> {
  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });

  if (error) {
    console.error("Resend error:", error);
    return { messageId: null };
  }

  return { messageId: data?.id ?? null };
}
