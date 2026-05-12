import { serve } from "inngest/next";
import { inngest } from "@/server/workflows/inngest";
import {
  sendAccountCreatedEmail,
  sendConsultationSubmittedEmail,
  sendConsultationApprovedEmail,
  sendConsultationRejectedEmail,
  sendActionRequiredEmail,
  sendOrderShippedEmail,
  sendOrderConfirmationEmail,
  sendAdminNewOrderEmail,
  sendPaymentCapturedEmail,
  sendReviewRequestEmail,
  checkExpiringAuthorizations,
} from "@/server/workflows/email-workflows";
import {
  cleanupStaleDraftConsultations,
  remindActionRequiredConsultations,
  alertStuckPackedOrders,
} from "@/server/workflows/operational-crons";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendAccountCreatedEmail,
    sendConsultationSubmittedEmail,
    sendConsultationApprovedEmail,
    sendConsultationRejectedEmail,
    sendActionRequiredEmail,
    sendOrderShippedEmail,
    sendOrderConfirmationEmail,
    sendAdminNewOrderEmail,
    sendPaymentCapturedEmail,
    sendReviewRequestEmail,
    checkExpiringAuthorizations,
    cleanupStaleDraftConsultations,
    remindActionRequiredConsultations,
    alertStuckPackedOrders,
  ],
});
