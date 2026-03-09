"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripeClient } from "@/lib/payments/stripe-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockIcon } from "@/components/icons";
import { CartSummary } from "./cart-summary";
import { createCheckoutAction } from "@/app/(shop)/checkout/actions";
import type { CreateOrderResult } from "@/server/services/order";
import { ROUTES } from "@/lib/constants";
import type { AddressInput } from "@/lib/validation/schemas";

export interface SavedAddress {
  id: string;
  label?: string | null;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string | null;
  city: string;
  postcode: string;
  countryCode: string;
  phone?: string | null;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

interface CheckoutFormProps {
  subtotalMinor: number;
  totalMinor: number;
  itemCount: number;
  hasPomItems: boolean;
  savedAddresses: SavedAddress[];
}

const INITIAL_ADDRESS: AddressInput = {
  firstName: "",
  lastName: "",
  line1: "",
  line2: "",
  city: "",
  postcode: "",
  countryCode: "GB",
  phone: "",
  isDefaultShipping: false,
  isDefaultBilling: false,
};

function savedToInput(saved: SavedAddress): AddressInput {
  return {
    firstName: saved.firstName,
    lastName: saved.lastName,
    line1: saved.line1,
    line2: saved.line2 ?? "",
    city: saved.city,
    postcode: saved.postcode,
    countryCode: saved.countryCode,
    phone: saved.phone ?? "",
    isDefaultShipping: saved.isDefaultShipping,
    isDefaultBilling: saved.isDefaultBilling,
  };
}

export function CheckoutForm(props: CheckoutFormProps) {
  const { savedAddresses } = props;

  const defaultAddress = useMemo(
    () => savedAddresses.find((a) => a.isDefaultShipping) ?? null,
    [savedAddresses],
  );

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [address, setAddress] = useState<AddressInput>(
    defaultAddress ? savedToInput(defaultAddress) : INITIAL_ADDRESS,
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    defaultAddress?.id ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateAddress(field: keyof AddressInput, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  function handleSelectSavedAddress(addressId: string) {
    setSelectedAddressId(addressId);
    if (addressId === "") {
      setAddress(INITIAL_ADDRESS);
      return;
    }
    const found = savedAddresses.find((a) => a.id === addressId);
    if (found) {
      setAddress(savedToInput(found));
    }
  }

  function handleCreateOrder() {
    setError(null);
    startTransition(async () => {
      const result = await createCheckoutAction({
        shippingAddress: address,
        useSameForBilling: true,
      });

      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      setClientSecret(result.clientSecret ?? null);
      setOrderId(result.orderId ?? null);
    });
  }

  // Step 1: Address entry
  if (!clientSecret) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-6 text-xl font-medium text-roots-navy">
            Shipping Address
          </h2>

          {props.hasPomItems && (
            <div className="mb-6 rounded-xl border border-roots-orange/30 bg-roots-orange/5 p-4 text-sm text-roots-navy/80">
              Prescription items require clinical approval. Your payment will be
              authorised but not charged until a prescriber reviews your
              consultation.
            </div>
          )}

          {savedAddresses.length > 0 && (
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-roots-navy/70">
                Use a saved address
              </label>
              <select
                value={selectedAddressId}
                onChange={(e) => handleSelectSavedAddress(e.target.value)}
                className="w-full rounded-xl border border-roots-navy/20 bg-white px-4 py-3 text-sm text-roots-navy outline-none transition-colors focus:border-roots-green focus:ring-1 focus:ring-roots-green"
              >
                <option value="">Enter a new address</option>
                {savedAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label
                      ? `${addr.label} — `
                      : ""}
                    {addr.firstName} {addr.lastName}, {addr.line1}, {addr.city},{" "}
                    {addr.postcode}
                    {addr.isDefaultShipping ? " (default)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                value={address.firstName}
                onChange={(e) => updateAddress("firstName", e.target.value)}
                required
              />
              <Input
                label="Last name"
                value={address.lastName}
                onChange={(e) => updateAddress("lastName", e.target.value)}
                required
              />
            </div>
            <Input
              label="Address line 1"
              value={address.line1}
              onChange={(e) => updateAddress("line1", e.target.value)}
              required
            />
            <Input
              label="Address line 2 (optional)"
              value={address.line2 ?? ""}
              onChange={(e) => updateAddress("line2", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={address.city}
                onChange={(e) => updateAddress("city", e.target.value)}
                required
              />
              <Input
                label="Postcode"
                value={address.postcode}
                onChange={(e) => updateAddress("postcode", e.target.value)}
                required
              />
            </div>
            <Input
              label="Phone (optional)"
              type="tel"
              value={address.phone ?? ""}
              onChange={(e) => updateAddress("phone", e.target.value)}
            />
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          <Button
            className="mt-8"
            onClick={handleCreateOrder}
            loading={isPending}
            disabled={!address.firstName || !address.line1 || !address.city || !address.postcode}
          >
            Continue to Payment
          </Button>
        </div>

        <div>
          <CartSummary
            subtotalMinor={props.subtotalMinor}
            totalMinor={props.totalMinor}
            itemCount={props.itemCount}
          />
        </div>
      </div>
    );
  }

  // Step 2: Payment with Stripe Elements
  return (
    <Elements
      stripe={getStripeClient()}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#045c4b",
            fontFamily: "DM Sans, sans-serif",
            borderRadius: "12px",
          },
        },
      }}
    >
      <PaymentStep
        {...props}
        clientSecret={clientSecret}
        orderId={orderId}
      />
    </Elements>
  );
}

function PaymentStep({
  subtotalMinor,
  totalMinor,
  itemCount,
  hasPomItems,
  clientSecret,
  orderId,
}: CheckoutFormProps & { clientSecret: string; orderId: string | null }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Payment failed.");
      setIsProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}${ROUTES.checkoutConfirmation}?order_id=${orderId}`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      setIsProcessing(false);
    }
    // If no error, Stripe redirects automatically
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="mb-6 text-xl font-medium text-roots-navy">Payment</h2>

        {hasPomItems && (
          <div className="mb-6 rounded-xl border border-roots-orange/30 bg-roots-orange/5 p-4 text-sm text-roots-navy/80">
            Your card will be <strong>authorised</strong> but not charged until
            your consultation is approved by a prescriber.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <PaymentElement />

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          <Button
            type="submit"
            className="mt-8 w-full"
            size="lg"
            loading={isProcessing}
            disabled={!stripe || !elements}
          >
            <LockIcon size={18} className="mr-2" />
            {hasPomItems ? "Authorise Payment" : "Pay Now"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-roots-navy/40">
          Secured by Stripe. Your payment details are encrypted.
        </p>
      </div>

      <div>
        <CartSummary
          subtotalMinor={subtotalMinor}
          totalMinor={totalMinor}
          itemCount={itemCount}
        />
      </div>
    </div>
  );
}
