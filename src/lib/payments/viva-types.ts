/**
 * Viva.com payment domain types and constants.
 *
 * Source: https://developer.viva.com/integration-reference/response-codes/
 *         https://developer.viva.com/webhooks-for-payments/
 */

/**
 * 16-digit Viva OrderCode. Exceeds Number.MAX_SAFE_INTEGER (2^53 - 1), so
 * it MUST be passed/stored as a string everywhere — coercing through Number
 * silently corrupts it. Branded so the type system enforces this.
 */
export type OrderCode = string & { readonly __brand: "VivaOrderCode" };

/** Helper: cast any string we know to be an OrderCode. */
export function asOrderCode(s: string): OrderCode {
  return s as OrderCode;
}

/**
 * Transaction lifecycle state.
 *  F  Finished — successful (also returned by successful capture/void/refund)
 *  A  Active  — pending (e.g. 3DS in progress)
 *  C  Captured — original preauth, after capture transaction posted
 *  E  Error — payment unsuccessful
 *  R  Refunded (full or partial)
 *  X  Cancelled by merchant
 *  M*, MA, MI, ML, MW, MS — dispute / chargeback states
 */
export type VivaStatusId = "F" | "A" | "C" | "E" | "R" | "X" | "M" | "MA" | "MI" | "ML" | "MW" | "MS";

/** TransactionTypeId values we care about. */
export const VivaTransactionType = {
  CardCapture: 0,
  CardPreauth: 1,
  CardRefund: 4,
  CardCharge: 5,
  CardVoid: 7,
} as const;

export type VivaTransactionTypeId = (typeof VivaTransactionType)[keyof typeof VivaTransactionType];

/** Webhook event types we subscribe to. */
export const VivaEventType = {
  TransactionPaymentCreated: 1796, // Successful payment / capture
  TransactionReversalCreated: 1797, // Refund or void executed
  TransactionFailed: 1798,
  OrderUpdated: 4865, // e.g. customer hit back during checkout
} as const;

export type VivaEventTypeId = (typeof VivaEventType)[keyof typeof VivaEventType];

/** ISO 4217 numeric currency codes used in Viva responses. */
export const VivaCurrency = {
  GBP: "826",
  EUR: "978",
} as const;

/**
 * IP allowlist for inbound webhooks — the only documented mechanism to
 * authenticate the SOURCE of webhook POSTs (Viva does not sign payloads).
 * Source: https://developer.viva.com/webhooks-for-payments/
 */
export const VIVA_DEMO_IPS: readonly string[] = [
  "20.50.240.57",
  "40.74.20.78",
  "195.167.87.181",
  "195.167.87.180",
  "20.13.195.185",
  "135.225.16.50",
];

/**
 * Production webhook source IPs. Some entries are CIDR; resolution uses
 * `lib/security/ip-allowlist.ts` to handle both single IPs and CIDR ranges.
 */
export const VIVA_PROD_IPS: readonly string[] = [
  "51.138.37.238",
  "13.80.70.181",
  "13.80.71.223",
  "13.79.28.70",
  "40.127.253.112/28",
  "51.105.129.192/28",
  "20.54.89.16",
  "4.223.76.50",
  "51.12.157.0/28",
];

/** Order creation request body — `POST /checkout/v2/orders` (Bearer auth). */
export interface CreateOrderRequest {
  /** Amount in MINOR units (pence). 1000 = £10.00. */
  amount: number;
  /** When true, authorize-only — capture must follow. */
  preauth: boolean;
  /** 4-digit source code from the dashboard — binds currency + return URLs. */
  sourceCode: string;
  /** Internal reference. We always set this to a UUID for idempotency. */
  merchantTrns: string;
  /** Description shown to the customer on the Viva checkout page. */
  customerTrns: string;
  /** Pre-fill customer info on the checkout page. */
  customer: {
    email?: string;
    fullName?: string;
    phone?: string;
    countryCode?: string;
    requestLang?: string;
  };
  /** Seconds before the order expires. Default 1800 (30 min). */
  paymentTimeout?: number;
  /** Searchable tags. */
  tags?: string[];
}

/**
 * Order creation response. Viva's two API surfaces have inconsistent shapes:
 *   - the OAuth2 v2 endpoint returns `{ orderCode: 4335... }`
 *   - some legacy code paths return `{ OrderCode, ErrorCode, Success, ... }`
 * We normalise to a single `orderCode` field at the client boundary.
 */
export interface CreateOrderResponse {
  orderCode: OrderCode;
}

/** Capture / void / refund response shape (legacy v1 endpoint). */
export interface TransactionMutationResponse {
  StatusId: VivaStatusId;
  Amount?: number;
  TransactionId?: string;
  CurrencyCode?: string;
  ReferenceNumber?: number;
  AuthorizationId?: string;
  ErrorCode: number;
  ErrorText: string | null;
  EventId: number;
  Success: boolean;
  TimeStamp?: string;
}

/**
 * Transaction details from `GET /checkout/v2/transactions/{transactionId}`.
 * Used to revalidate inbound webhook payloads (per Viva guidance: never
 * trust the webhook body alone).
 */
export interface RetrieveTransactionResponse {
  transactionId: string;
  orderCode: OrderCode;
  statusId: VivaStatusId;
  amount: number; // MINOR units
  currencyCode: string;
  merchantTrns: string | null;
  customerTrns: string | null;
  cardNumber: string | null;
  cardToken: string | null;
  cardCountryCode: string | null;
  transactionTypeId: VivaTransactionTypeId;
  insDate: string;
}

/** Inbound webhook POST payload envelope. */
export interface WebhookEnvelope<TEventData = unknown> {
  Url: string;
  EventTypeId: VivaEventTypeId;
  Created: string;
  CorrelationId: string;
  MessageId: string;
  RecipientId: string;
  RetryCount: number;
  RetryDelayInSeconds: number | null;
  EventData: TEventData;
}

/** EventData for EventTypeId 1796 / 1798 (payment success / failed). */
export interface TransactionEventData {
  TransactionId: string;
  OrderCode: number; // arrives as JSON number — coerce to string immediately
  StatusId: VivaStatusId;
  Amount: number;
  MerchantId: string;
  MerchantTrns: string | null;
  CustomerTrns: string | null;
  CurrencyCode: string;
  TransactionTypeId: VivaTransactionTypeId;
  Email: string | null;
  Phone: string | null;
  FullName: string | null;
  CardToken: string | null;
  CardNumber: string | null;
  ParentId: string | null;
  AuthorizationId: string | null;
  SourceCode: string | null;
  InsDate: string;
  Tags?: string[];
}
