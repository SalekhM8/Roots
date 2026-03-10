/**
 * ROOTS Pharmacy — branded email templates.
 * Dark green header with logo, cream background, clean editorial layout.
 */

const BRAND = {
  green: "#045c4b",
  greenLight: "#067a64",
  cream: "#fdf0d5",
  creamDark: "#f5e6c4",
  navy: "#003049",
  white: "#ffffff",
  grey: "#6b7280",
  greyLight: "#f3f4f6",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rootspharmacy.co.uk",
};

function layout(title: string, preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.cream};font-family:'DM Sans',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preheader text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.cream};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Logo Header -->
        <tr><td style="background-color:${BRAND.green};padding:28px 40px;border-radius:16px 16px 0 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <span style="font-size:28px;font-weight:900;letter-spacing:-1px;color:${BRAND.cream};text-transform:uppercase;font-family:'DM Sans',Helvetica,Arial,sans-serif;">ROOTS</span>
                <br>
                <span style="font-size:9px;font-weight:700;letter-spacing:4px;color:rgba(253,240,213,0.7);text-transform:uppercase;font-family:'DM Sans',Helvetica,Arial,sans-serif;">PHARMACY</span>
              </td>
              <td align="right" valign="middle">
                <span style="font-size:12px;color:rgba(253,240,213,0.6);font-family:'DM Sans',Helvetica,Arial,sans-serif;">GPhC Registered</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Accent line -->
        <tr><td style="background:linear-gradient(90deg,${BRAND.green},${BRAND.greenLight});height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- Body -->
        <tr><td style="background-color:${BRAND.white};padding:40px 40px 32px;">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:${BRAND.white};padding:0 40px 32px;border-radius:0 0 16px 16px;">
          <!-- Divider -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="border-top:1px solid #e5e7eb;padding-top:24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px;color:${BRAND.grey};line-height:1.5;">
                    <strong style="color:${BRAND.green};font-size:13px;">ROOTS Pharmacy</strong><br>
                    Clinical weight management &amp; wellness<br>
                    <a href="${BRAND.siteUrl}" style="color:${BRAND.green};text-decoration:none;">www.rootspharmacy.co.uk</a>
                  </td>
                  <td align="right" valign="top" style="font-size:11px;color:#9ca3af;line-height:1.5;">
                    Questions? <a href="${BRAND.siteUrl}/contact" style="color:${BRAND.green};text-decoration:none;">Contact us</a><br>
                    <a href="${BRAND.siteUrl}/privacy" style="color:#9ca3af;text-decoration:none;">Privacy Policy</a> &middot; <a href="${BRAND.siteUrl}/terms" style="color:#9ca3af;text-decoration:none;">Terms</a>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Sub-footer -->
        <tr><td align="center" style="padding:20px 40px 0;">
          <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.4;">
            &copy; ${new Date().getFullYear()} Roots Pharmacy Ltd. All rights reserved.<br>
            You're receiving this because you have an account at rootspharmacy.co.uk
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function cta(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
  <tr><td style="background-color:${BRAND.green};border-radius:12px;padding:0;">
    <a href="${href}" style="display:inline-block;padding:16px 36px;color:${BRAND.cream};text-decoration:none;font-weight:600;font-size:15px;font-family:'DM Sans',Helvetica,Arial,sans-serif;letter-spacing:0.01em;" target="_blank">${label}</a>
  </td></tr>
</table>`;
}

function heading(text: string, color?: string): string {
  return `<h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${color ?? BRAND.green};letter-spacing:-0.5px;font-family:'DM Sans',Helvetica,Arial,sans-serif;">${text}</h2>`;
}

function greeting(name: string): string {
  return `<p style="margin:0 0 20px;font-size:15px;color:${BRAND.navy};line-height:1.6;">Hi ${name},</p>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:${BRAND.navy};line-height:1.7;">${text}</p>`;
}

function infoBox(content: string, variant: "green" | "amber" | "neutral" = "neutral"): string {
  const styles = {
    green: `background-color:rgba(4,92,75,0.06);border:1px solid rgba(4,92,75,0.12);`,
    amber: `background-color:#fef9ee;border:1px solid #fde68a;`,
    neutral: `background-color:${BRAND.greyLight};border:1px solid #e5e7eb;`,
  };
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
  <tr><td style="${styles[variant]}border-radius:12px;padding:20px 24px;">
    ${content}
  </td></tr>
</table>`;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export function consultationSubmitted(name: string): string {
  return layout(
    "Consultation Received — ROOTS Pharmacy",
    `Hi ${name}, we've received your consultation and a prescriber will review it within 48 hours.`,
    `${heading("Consultation Received")}
    ${greeting(name)}
    ${paragraph("Thank you for submitting your consultation. A qualified prescriber will review your information within <strong>48 hours</strong>.")}
    ${infoBox(`
      <p style="margin:0;font-size:14px;color:${BRAND.navy};line-height:1.6;">
        <strong>What happens next?</strong><br>
        Our clinical team will review your answers and medical history. We'll email you as soon as a decision has been made.
      </p>
    `, "green")}
    ${paragraph("You can check your consultation status at any time from your account dashboard.")}
    ${cta("View My Consultations", `${BRAND.siteUrl}/account/consultations`)}`
  );
}

export function consultationApproved(name: string, orderNumber?: string): string {
  return layout(
    "You're Approved — ROOTS Pharmacy",
    `Great news ${name}, your consultation has been approved and your order is being prepared.`,
    `${heading("You're Approved")}
    ${greeting(name)}
    ${paragraph("Great news — your consultation has been reviewed and <strong>approved</strong> by our prescribing team.")}
    ${orderNumber ? infoBox(`
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.grey};font-weight:600;padding-bottom:4px;">Order Reference</td>
        </tr>
        <tr>
          <td style="font-size:20px;font-weight:700;color:${BRAND.green};letter-spacing:-0.5px;">${orderNumber}</td>
        </tr>
      </table>
    `, "green") : ""}
    ${paragraph("Your payment has been captured and your order is now being prepared for dispatch. You'll receive a shipping confirmation with tracking details once it's on its way.")}
    ${cta("View My Orders", `${BRAND.siteUrl}/account/orders`)}`
  );
}

export function consultationRejected(name: string, reason: string): string {
  return layout(
    "Consultation Update — ROOTS Pharmacy",
    `Hi ${name}, we have an update about your consultation.`,
    `${heading("Consultation Update", BRAND.navy)}
    ${greeting(name)}
    ${paragraph("After careful review, our prescriber has determined that this treatment is <strong>not suitable</strong> for you at this time.")}
    ${infoBox(`
      <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.grey};font-weight:600;">Prescriber's Note</p>
      <p style="margin:0;font-size:15px;color:${BRAND.navy};line-height:1.7;font-style:italic;">"${reason}"</p>
    `, "amber")}
    ${paragraph("Your payment authorisation has been released and <strong>you will not be charged</strong>. If you have any questions about this decision, our team is here to help.")}
    ${cta("Contact Us", `${BRAND.siteUrl}/contact`)}`
  );
}

export function actionRequired(name: string, message: string): string {
  return layout(
    "Action Required — ROOTS Pharmacy",
    `Hi ${name}, our prescriber needs additional information to complete your consultation.`,
    `${heading("Action Required", BRAND.navy)}
    ${greeting(name)}
    ${paragraph("Our prescriber needs some additional information before they can complete your consultation review.")}
    ${infoBox(`
      <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.grey};font-weight:600;">What's Needed</p>
      <p style="margin:0;font-size:15px;color:${BRAND.navy};line-height:1.7;">"${message}"</p>
    `, "amber")}
    ${paragraph("Please log in to your account to provide the requested information so we can proceed with your review.")}
    ${cta("View My Consultation", `${BRAND.siteUrl}/account/consultations`)}`
  );
}

export function orderConfirmation(name: string, orderNumber: string, isPom: boolean): string {
  return layout(
    "Order Confirmed — ROOTS Pharmacy",
    `Hi ${name}, your order ${orderNumber} has been confirmed.`,
    `${heading("Order Confirmed")}
    ${greeting(name)}
    ${infoBox(`
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.grey};font-weight:600;padding-bottom:4px;">Order Reference</td>
        </tr>
        <tr>
          <td style="font-size:20px;font-weight:700;color:${BRAND.green};letter-spacing:-0.5px;">${orderNumber}</td>
        </tr>
      </table>
    `, "green")}
    ${isPom
      ? paragraph("Your payment has been <strong>authorised</strong> (not yet charged). We'll capture payment once your consultation has been reviewed and approved by our prescriber.")
      : paragraph("Your payment has been processed and we're now <strong>preparing your order</strong> for dispatch.")
    }
    ${paragraph("You'll receive email updates as your order progresses.")}
    ${cta("View My Orders", `${BRAND.siteUrl}/account/orders`)}`
  );
}

export function orderShipped(name: string, orderNumber: string, trackingUrl?: string): string {
  return layout(
    "Order Shipped — ROOTS Pharmacy",
    `Great news ${name}, your order ${orderNumber} is on its way!`,
    `${heading("Your Order Has Shipped")}
    ${greeting(name)}
    ${paragraph(`Your order <strong>${orderNumber}</strong> has been dispatched and is on its way to you.`)}
    ${infoBox(`
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:14px;color:${BRAND.navy};line-height:1.6;">
            <strong>Delivery:</strong> Royal Mail Tracked<br>
            <strong>Estimated:</strong> 1-3 working days
          </td>
        </tr>
      </table>
    `, "green")}
    ${trackingUrl
      ? cta("Track Your Order", trackingUrl)
      : paragraph("Tracking details will be available shortly.")
    }`
  );
}

export function paymentCaptured(name: string, amount: string, orderNumber: string): string {
  return layout(
    "Payment Confirmed — ROOTS Pharmacy",
    `Hi ${name}, your payment of ${amount} for order ${orderNumber} has been confirmed.`,
    `${heading("Payment Confirmed")}
    ${greeting(name)}
    ${infoBox(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:12px;">
            <span style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.grey};font-weight:600;">Amount Charged</span><br>
            <span style="font-size:22px;font-weight:700;color:${BRAND.green};">${amount}</span>
          </td>
          <td align="right" style="padding-bottom:12px;">
            <span style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.grey};font-weight:600;">Order</span><br>
            <span style="font-size:16px;font-weight:600;color:${BRAND.navy};">${orderNumber}</span>
          </td>
        </tr>
      </table>
    `, "green")}
    ${paragraph("Your order is now being prepared for dispatch. You'll receive a shipping confirmation with tracking details once it's on its way.")}
    ${cta("View My Orders", `${BRAND.siteUrl}/account/orders`)}`
  );
}

export function paymentExpired(name: string, orderNumber: string): string {
  return layout(
    "Payment Expired — ROOTS Pharmacy",
    `Hi ${name}, the payment authorisation for order ${orderNumber} has expired.`,
    `${heading("Payment Authorisation Expired", BRAND.navy)}
    ${greeting(name)}
    ${paragraph(`The payment authorisation for order <strong>${orderNumber}</strong> has expired. <strong>Your card has not been charged.</strong>`)}
    ${infoBox(`
      <p style="margin:0;font-size:14px;color:${BRAND.navy};line-height:1.6;">
        This can happen if a consultation review takes longer than expected. We apologise for any inconvenience.
      </p>
    `, "amber")}
    ${paragraph("If you'd still like to proceed with your order, please visit our website to place a new one.")}
    ${cta("Visit ROOTS Pharmacy", BRAND.siteUrl)}`
  );
}
