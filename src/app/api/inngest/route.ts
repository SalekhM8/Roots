import { serve } from "inngest/next";
import { inngest } from "@/server/workflows/inngest";
import {
  sendConsultationSubmittedEmail,
  sendConsultationApprovedEmail,
  sendConsultationRejectedEmail,
  sendActionRequiredEmail,
  sendOrderShippedEmail,
  checkExpiringAuthorizations,
} from "@/server/workflows/email-workflows";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendConsultationSubmittedEmail,
    sendConsultationApprovedEmail,
    sendConsultationRejectedEmail,
    sendActionRequiredEmail,
    sendOrderShippedEmail,
    checkExpiringAuthorizations,
  ],
});
