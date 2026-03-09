/**
 * ROOTS branded email templates.
 * Dark green/cream design, clean layout, one primary CTA per email.
 */

const BRAND = {
  green: "#045c4b",
  cream: "#fdf0d5",
  navy: "#003049",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://rootspharmacy.co.uk",
};

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:${BRAND.cream};font-family:'DM Sans',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:${BRAND.green};padding:24px 32px;">
          <span style="font-size:24px;font-weight:900;letter-spacing:-1px;color:${BRAND.cream};text-transform:uppercase;">ROOTS</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;color:${BRAND.navy};font-size:15px;line-height:1.6;">
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 32px;font-size:12px;color:#999;border-top:1px solid #eee;">
          ROOTS Pharmacy &middot; <a href="${BRAND.siteUrl}" style="color:${BRAND.green};">rootspharmacy.co.uk</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function cta(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;padding:14px 32px;background:${BRAND.green};color:${BRAND.cream};text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;margin:16px 0;">${label}</a>`;
}

export function consultationSubmitted(name: string): string {
  return layout(
    "Consultation Received",
    `<h2 style="margin:0 0 16px;color:${BRAND.green};">Consultation Received</h2>
    <p>Hi ${name},</p>
    <p>Thank you for submitting your consultation. A qualified prescriber will review your information and get back to you within 48 hours.</p>
    <p>You can track your consultation status in your account.</p>
    ${cta("View My Consultations", `${BRAND.siteUrl}/account/consultations`)}`
  );
}

export function consultationApproved(name: string, orderNumber?: string): string {
  return layout(
    "Consultation Approved",
    `<h2 style="margin:0 0 16px;color:${BRAND.green};">Good News — You're Approved</h2>
    <p>Hi ${name},</p>
    <p>Your consultation has been reviewed and approved by our prescribing team. Your payment has been captured and your order is being prepared for dispatch.</p>
    ${orderNumber ? `<p>Order reference: <strong>${orderNumber}</strong></p>` : ""}
    ${cta("View My Orders", `${BRAND.siteUrl}/account/orders`)}`
  );
}

export function consultationRejected(name: string, reason: string): string {
  return layout(
    "Consultation Update",
    `<h2 style="margin:0 0 16px;color:${BRAND.navy};">Consultation Update</h2>
    <p>Hi ${name},</p>
    <p>After careful review, our prescriber has determined that this treatment is not suitable for you at this time.</p>
    <p><em>"${reason}"</em></p>
    <p>Your payment authorization has been released and you will not be charged. If you have any questions, please don't hesitate to contact us.</p>
    ${cta("Contact Us", `${BRAND.siteUrl}/contact`)}`
  );
}

export function actionRequired(name: string, message: string): string {
  return layout(
    "Action Required",
    `<h2 style="margin:0 0 16px;color:${BRAND.navy};">Action Required</h2>
    <p>Hi ${name},</p>
    <p>Our prescriber needs additional information to complete your consultation review:</p>
    <p><em>"${message}"</em></p>
    <p>Please log in to your account to provide the requested information.</p>
    ${cta("View My Consultation", `${BRAND.siteUrl}/account/consultations`)}`
  );
}

export function orderConfirmation(name: string, orderNumber: string, isPom: boolean): string {
  return layout(
    "Order Confirmed",
    `<h2 style="margin:0 0 16px;color:${BRAND.green};">Order Confirmed</h2>
    <p>Hi ${name},</p>
    <p>Your order <strong>${orderNumber}</strong> has been received.</p>
    ${isPom
      ? "<p>Your payment has been authorised. We will capture payment once your consultation has been reviewed and approved.</p>"
      : "<p>Your payment has been processed. We're preparing your order for dispatch.</p>"
    }
    ${cta("View My Orders", `${BRAND.siteUrl}/account/orders`)}`
  );
}

export function orderShipped(name: string, orderNumber: string, trackingUrl?: string): string {
  return layout(
    "Order Shipped",
    `<h2 style="margin:0 0 16px;color:${BRAND.green};">Your Order Has Shipped</h2>
    <p>Hi ${name},</p>
    <p>Great news — order <strong>${orderNumber}</strong> is on its way to you.</p>
    ${trackingUrl ? cta("Track Your Order", trackingUrl) : "<p>Tracking details will be available shortly.</p>"}`
  );
}

export function paymentExpired(name: string, orderNumber: string): string {
  return layout(
    "Payment Authorization Expired",
    `<h2 style="margin:0 0 16px;color:${BRAND.navy};">Payment Authorization Expired</h2>
    <p>Hi ${name},</p>
    <p>The payment authorization for order <strong>${orderNumber}</strong> has expired. Your card has not been charged.</p>
    <p>If you'd still like to proceed, please place a new order through our website.</p>
    ${cta("Visit ROOTS", BRAND.siteUrl)}`
  );
}
