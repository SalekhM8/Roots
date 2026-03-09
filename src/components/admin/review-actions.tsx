"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  approveConsultationAction,
  rejectConsultationAction,
  requestMoreInfoAction,
} from "@/app/(admin)/admin/consultations/actions";

interface ReviewActionsProps {
  consultationId: string;
  isReviewable: boolean;
}

type ActionType = "approve" | "reject" | "more_info" | null;

export function ReviewActions({
  consultationId,
  isReviewable,
}: ReviewActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [internalNote, setInternalNote] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isReviewable) {
    return (
      <p className="text-sm text-roots-navy/50">
        This consultation is not in a reviewable state.
      </p>
    );
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      let result;
      if (activeAction === "approve") {
        result = await approveConsultationAction({
          consultationId,
          internalNote: internalNote || undefined,
          customerMessage: customerMessage || undefined,
        });
      } else if (activeAction === "reject") {
        if (!customerMessage.trim()) {
          setError("A message to the customer is required for rejections.");
          return;
        }
        result = await rejectConsultationAction({
          consultationId,
          internalNote: internalNote || undefined,
          customerMessage,
        });
      } else if (activeAction === "more_info") {
        if (!customerMessage.trim()) {
          setError("A message to the customer is required.");
          return;
        }
        result = await requestMoreInfoAction({
          consultationId,
          internalNote: internalNote || undefined,
          customerMessage,
        });
      }

      if (result && !result.success) {
        setError(result.error ?? "Something went wrong.");
      } else {
        router.push("/admin/consultations");
        router.refresh();
      }
    });
  }

  if (!activeAction) {
    return (
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setActiveAction("approve")}
        >
          Approve
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setActiveAction("reject")}
          className="bg-red-600 hover:bg-red-700 text-white hover:text-white"
        >
          Reject
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveAction("more_info")}
        >
          Request More Info
        </Button>
      </div>
    );
  }

  const actionLabel =
    activeAction === "approve"
      ? "Approve Consultation"
      : activeAction === "reject"
        ? "Reject Consultation"
        : "Request More Information";

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-roots-navy">{actionLabel}</h4>

      <div>
        <label className="mb-1 block text-sm text-roots-navy/70">
          Internal note (prescriber only)
        </label>
        <textarea
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          className="w-full rounded-xl border border-roots-green/15 bg-white p-3 text-sm outline-none focus:border-roots-green"
          rows={2}
        />
      </div>

      {(activeAction === "reject" || activeAction === "more_info") && (
        <div>
          <label className="mb-1 block text-sm text-roots-navy/70">
            Message to customer *
          </label>
          <textarea
            value={customerMessage}
            onChange={(e) => setCustomerMessage(e.target.value)}
            className="w-full rounded-xl border border-roots-green/15 bg-white p-3 text-sm outline-none focus:border-roots-green"
            rows={3}
            required
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button
          size="sm"
          variant={activeAction === "reject" ? "primary" : "secondary"}
          onClick={handleSubmit}
          loading={isPending}
          className={
            activeAction === "reject"
              ? "bg-red-600 hover:bg-red-700 text-white hover:text-white"
              : ""
          }
        >
          Confirm {activeAction === "approve" ? "Approval" : activeAction === "reject" ? "Rejection" : "Request"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setActiveAction(null);
            setError(null);
          }}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
