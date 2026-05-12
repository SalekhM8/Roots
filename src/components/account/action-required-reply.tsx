"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { respondToInfoRequest } from "@/app/(account)/account/consultations/[id]/actions";

interface ActionRequiredReplyProps {
  consultationId: string;
  prescriberMessage: string | null;
}

export function ActionRequiredReply({
  consultationId,
  prescriberMessage,
}: ActionRequiredReplyProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await respondToInfoRequest({
        consultationId,
        message: message.trim(),
      });
      if (!result.success) {
        setError(result.error ?? "Could not submit reply. Please try again.");
        return;
      }
      // Refresh the server component so the status pill, timeline, and
      // disappearance of this form all reflect the new submitted state.
      router.refresh();
    });
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-roots-orange/30 bg-roots-orange/5 p-5">
      <h2 className="mb-2 text-base font-medium text-roots-navy">
        Your prescriber has asked for more information
      </h2>
      {prescriberMessage && (
        <p className="mb-4 whitespace-pre-wrap text-sm text-roots-navy/80">
          {prescriberMessage}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-roots-navy">
          Your reply
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={submitting}
            rows={5}
            maxLength={2000}
            required
            minLength={10}
            placeholder="Please answer your prescriber's question in as much detail as you can."
            className="mt-1 w-full rounded-[var(--radius-input)] border border-roots-green/20 bg-white p-3 text-sm text-roots-navy focus:border-roots-green focus:outline-none"
          />
        </label>
        <div className="flex items-center justify-between text-xs text-roots-navy/50">
          <span>{message.length}/2000</span>
          {error && <span className="text-red-600">{error}</span>}
        </div>
        <Button type="submit" disabled={submitting || message.trim().length < 10}>
          {submitting ? "Sending…" : "Send reply to prescriber"}
        </Button>
      </form>
    </div>
  );
}
