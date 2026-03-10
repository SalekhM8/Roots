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
 * API expects: POST /orders with body { items: [ ...orders ] }
 */
export async function createClickDropOrder(
  params: CreateOrderParams
): Promise<ClickDropOrder> {
  const itemsTotal = params.items.reduce((s, i) => s + i.value * i.quantity, 0);

  const body = {
    items: [
      {
        orderReference: params.orderReference,
        recipient: {
          address: {
            fullName: params.recipientAddress.name,
            addressLine1: params.recipientAddress.line1,
            addressLine2: params.recipientAddress.line2 ?? "",
            city: params.recipientAddress.city,
            postcode: params.recipientAddress.postcode,
            countryCode: params.recipientAddress.countryCode,
          },
        },
        packages: [
          {
            weightInGrams: params.weightGrams,
            packageFormatIdentifier: "letter",
            contents: params.items.map((item) => ({
              name: item.description,
              SKU: "",
              quantity: item.quantity,
              unitValue: item.value,
              unitWeightInGrams: Math.round(params.weightGrams / params.items.length),
            })),
          },
        ],
        orderDate: new Date().toISOString(),
        subtotal: itemsTotal,
        shippingCostCharged: 0,
        total: itemsTotal,
        currencyCode: "GBP",
      },
    ],
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

  // Response: { createdOrders: [{ orderIdentifier, trackingNumber, ... }], failedOrders: [...] }
  const created = data.createdOrders?.[0];
  if (!created) {
    const failed = data.failedOrders?.[0];
    const errMsg = failed?.errors?.map((e: { errorMessage: string }) => e.errorMessage).join(", ") ?? "Unknown error";
    throw new Error(`Click & Drop order creation failed: ${errMsg}`);
  }

  const orderId = String(created.orderIdentifier);
  const trackingNumber: string | undefined = created.trackingNumber;

  return { orderId, trackingNumber };
}

/**
 * Get order info from Click & Drop.
 */
async function getClickDropOrderDetails(
  orderId: string
): Promise<{ trackingNumber?: string; status?: string }> {
  const response = await clickDropFetch(`/orders/${orderId}`);

  if (!response.ok) {
    throw new Error(`Click & Drop API error: ${response.status}`);
  }

  // GET /orders/{id} returns an array
  const data = await response.json();
  const order = Array.isArray(data) ? data[0] : data;
  return {
    trackingNumber: order?.trackingNumber,
    status: order?.orderStatus,
  };
}

/**
 * Get the label PDF for an order.
 * Returns the PDF as an ArrayBuffer, or null if not ready.
 */
export async function getClickDropLabelPdf(
  orderId: string
): Promise<ArrayBuffer | null> {
  const response = await clickDropFetch(`/orders/${orderId}/label`, {
    headers: { Accept: "application/pdf" },
  });

  if (!response.ok) {
    return null;
  }

  return response.arrayBuffer();
}

/**
 * Get tracking info for a Click & Drop order.
 */
export async function getClickDropTracking(
  orderId: string
): Promise<{ trackingNumber?: string; status?: string }> {
  return getClickDropOrderDetails(orderId);
}
