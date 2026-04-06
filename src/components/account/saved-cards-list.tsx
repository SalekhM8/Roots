"use client";

import { useState } from "react";
import {
  deleteSavedPaymentMethodAction,
  type SavedCard,
} from "@/app/(shop)/checkout/actions";
import { Button } from "@/components/ui/button";

const CARD_BRAND_LABELS: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  discover: "Discover",
  diners: "Diners",
  jcb: "JCB",
  unionpay: "UnionPay",
  unknown: "Card",
};

interface SavedCardsListProps {
  initialCards: SavedCard[];
}

export function SavedCardsList({ initialCards }: SavedCardsListProps) {
  const [cards, setCards] = useState<SavedCard[]>(initialCards);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(cardId: string) {
    setDeletingId(cardId);
    const result = await deleteSavedPaymentMethodAction(cardId);
    if (result.success) {
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    }
    setDeletingId(null);
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-[var(--radius-hero)] border border-dashed border-roots-green/15 py-16 text-center">
        <p className="text-lg font-medium text-roots-navy/50">
          No saved cards
        </p>
        <p className="mt-2 text-sm text-roots-navy/40">
          Cards will be saved automatically when you complete a purchase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <div
          key={card.id}
          className="flex items-center justify-between rounded-[var(--radius-card)] border border-roots-green/10 bg-white p-5 transition-shadow duration-200 hover:shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-roots-cream text-xs font-semibold uppercase text-roots-navy/60">
              {CARD_BRAND_LABELS[card.brand] ?? card.brand}
            </div>
            <div>
              <p className="text-sm font-medium text-roots-navy">
                •••• •••• •••• {card.last4}
              </p>
              <p className="text-xs text-roots-navy/40">
                Expires {String(card.expMonth).padStart(2, "0")}/{card.expYear}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(card.id)}
            loading={deletingId === card.id}
            className="text-roots-navy/40 hover:text-red-500"
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
