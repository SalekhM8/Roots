/**
 * Royal Mail Click & Drop API adapter.
 *
 * All shipping logic lives behind this adapter so the provider can be swapped.
 * API docs: https://api.parcel.royalmail.com/doc
 */

interface ClickDropAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  countryCode: string;
}

interface CreateOrderParams {
  orderReference: string;
  recipientAddress: ClickDropAddress;
  weightGrams: number;
  items: Array<{ description: string; quantity: number; value: number }>;
}

interface ClickDropOrder {
  orderId: string;
  trackingNumber?: string;
  labelUrl?: string;
}

const API_BASE = "https://api.parcel.royalmail.com/api/v1";

async function clickDropFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiKey = process.env.CLICK_DROP_API_KEY;
  if (!apiKey) throw new Error("CLICK_DROP_API_KEY is not set");

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

/**
 * Create an order in Click & Drop for label generation.
 */
export async function createClickDropOrder(
  params: CreateOrderParams
): Promise<ClickDropOrder> {
  const itemsTotal = params.items.reduce((s, i) => s + i.value * i.quantity, 0);

  const body = {
    orderReference: params.orderReference,
    recipient: {
      fullName: params.recipientAddress.name,
      addressLine1: params.recipientAddress.line1,
      addressLine2: params.recipientAddress.line2 ?? "",
      city: params.recipientAddress.city,
      postcode: params.recipientAddress.postcode,
      countryCode: params.recipientAddress.countryCode,
    },
    package: {
      weightInGrams: params.weightGrams,
      packageFormatIdentifier: "letter",
    },
    orderDate: new Date().toISOString(),
    subtotal: itemsTotal,
    shippingCostPaid: 0,
    total: itemsTotal,
    currencyCode: "GBP",
    items: params.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      value: item.value,
      weight: params.weightGrams,
      sku: "",
    })),
  };

  const response = await clickDropFetch("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Click & Drop API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  return {
    orderId: data.orderIdentifier ?? data.orderId ?? "",
    trackingNumber: data.trackingNumber,
    labelUrl: data.labelUrl,
  };
}

/**
 * Get tracking info for a Click & Drop order.
 */
export async function getClickDropTracking(
  orderId: string
): Promise<{ trackingNumber?: string; status?: string }> {
  const response = await clickDropFetch(`/orders/${orderId}`);

  if (!response.ok) {
    throw new Error(`Click & Drop API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    trackingNumber: data.trackingNumber,
    status: data.status,
  };
}
