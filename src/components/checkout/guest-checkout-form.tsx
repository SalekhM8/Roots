"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripeClient } from "@/lib/payments/stripe-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockIcon, CartIcon } from "@/components/icons";
import { CartSummary } from "./cart-summary";
import { CheckoutReviews } from "./checkout-reviews";
import { createGuestCheckoutAction } from "@/app/(shop)/checkout/guest/actions";
import { useGuestCart, type GuestCartItem } from "@/hooks/use-guest-cart";
import { formatPrice } from "@/lib/utils";
import { calculateShipping } from "@/lib/constants";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import type { AddressInput } from "@/lib/validation/schemas";

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

export function GuestCheckoutClient() {
  const { items, subtotalMinor, count, removeItem, updateQuantity, clear } =
    useGuestCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<AddressInput>(INITIAL_ADDRESS);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (count === 0 && !clientSecret) {
    return (
      <EmptyState
        icon={<CartIcon size={48} />}
        message="Your cart is empty"
        actionLabel="Browse products"
        actionHref="/collections/vitamins-supplements"
      />
    );
  }

  const shippingMinor = calculateShipping(subtotalMinor);
  const totalMinor = subtotalMinor + shippingMinor;

  function updateAddress(field: keyof AddressInput, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  function handleCreateOrder() {
    setError(null);
    startTransition(async () => {
      const result = await createGuestCheckoutAction({
        email,
        phone: phone || undefined,
        shippingAddress: address,
        useSameForBilling: true,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      });

      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      setClientSecret(result.clientSecret ?? null);
      setOrderId(result.orderId ?? null);
    });
  }

  const canSubmit =
    email.includes("@") &&
    address.firstName &&
    address.lastName &&
    address.line1 &&
    address.city &&
    address.postcode;

  // Step 1: Cart review + contact + address
  if (!clientSecret) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Cart items */}
          <div>
            <h2 className="mb-4 text-xl font-medium text-roots-navy">
              Your Items
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <GuestCartItemRow
                  key={item.variantId}
                  item={item}
                  onRemove={() => removeItem(item.variantId)}
                  onUpdateQuantity={(qty) =>
                    updateQuantity(item.variantId, qty)
                  }
                />
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div>
            <h2 className="mb-4 text-xl font-medium text-roots-navy">
              Contact Information
            </h2>
            <div className="space-y-4">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Phone (optional)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <p className="mt-2 text-xs text-roots-navy/50">
              We&apos;ll send your order confirmation and tracking info to this
              email.
            </p>
          </div>

          {/* Shipping address */}
          <div>
            <h2 className="mb-4 text-xl font-medium text-roots-navy">
              Shipping Address
            </h2>
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
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            onClick={handleCreateOrder}
            loading={isPending}
            disabled={!canSubmit}
          >
            Continue to Payment
          </Button>

          <p className="text-sm text-roots-navy/50">
            Already have an account?{" "}
            <Link href="/sign-in" className="underline text-roots-green">
              Sign in
            </Link>{" "}
            for faster checkout.
          </p>
        </div>

        <div className="space-y-5">
          <CartSummary
            subtotalMinor={subtotalMinor}
            shippingMinor={shippingMinor}
            totalMinor={totalMinor}
            itemCount={count}
          />
          <CheckoutReviews />
        </div>
      </div>
    );
  }

  // Step 2: Payment
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
      <GuestPaymentStep
        clientSecret={clientSecret}
        orderId={orderId}
        subtotalMinor={subtotalMinor}
        shippingMinor={shippingMinor}
        totalMinor={totalMinor}
        itemCount={count}
        onSuccess={clear}
      />
    </Elements>
  );
}

function GuestPaymentStep({
  clientSecret,
  orderId,
  subtotalMinor,
  shippingMinor,
  totalMinor,
  itemCount,
  onSuccess,
}: {
  clientSecret: string;
  orderId: string | null;
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  itemCount: number;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
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
        return_url: `${window.location.origin}/checkout/confirmation?order_id=${orderId}`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="mb-6 text-xl font-medium text-roots-navy">Payment</h2>

        <form onSubmit={handleSubmit}>
          <PaymentElement />

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            className="mt-8 w-full"
            size="lg"
            loading={isProcessing}
            disabled={!stripe || !elements}
          >
            <LockIcon size={18} className="mr-2" />
            Pay Now
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-roots-navy/40">
          Secured by Stripe. Your payment details are encrypted.
        </p>
      </div>

      <div className="space-y-5">
        <CartSummary
          subtotalMinor={subtotalMinor}
          shippingMinor={shippingMinor}
          totalMinor={totalMinor}
          itemCount={itemCount}
        />
        <CheckoutReviews />
      </div>
    </div>
  );
}

function GuestCartItemRow({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: GuestCartItem;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-roots-navy/10 bg-white p-4">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.productName}
          className="h-16 w-16 rounded-lg object-cover"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-roots-green truncate">
          {item.productName}
        </p>
        <p className="text-sm text-roots-navy/60">{item.variantName}</p>
        <p className="text-sm font-medium text-roots-green">
          {formatPrice(item.priceMinor)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(Number(e.target.value))}
          className="rounded-lg border border-roots-navy/20 bg-white px-2 py-1 text-sm"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
