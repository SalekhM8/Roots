import { db } from "@/lib/db";
import type { ConsultationStatus, PaymentStatus, FulfillmentStatus } from "@/generated/prisma";

const PAGE_SIZE = 25;

// ---- Dashboard Stats ----
export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [awaitingReview, awaitingFulfillment, actionRequired, shippedToday, authExpiring] =
    await Promise.all([
      db.consultation.count({
        where: { status: { in: ["submitted", "under_review"] } },
      }),
      db.order.count({
        where: { fulfillmentStatus: "ready_to_pack", paymentStatus: "captured" },
      }),
      db.consultation.count({
        where: { status: "action_required" },
      }),
      db.order.count({
        where: {
          shippingStatus: { in: ["in_transit", "collected"] },
          updatedAt: { gte: todayStart },
        },
      }),
      db.payment.count({
        where: {
          status: "authorized",
          captureBefore: { lte: in24Hours, gt: now },
        },
      }),
    ]);

  return { awaitingReview, awaitingFulfillment, actionRequired, shippedToday, authExpiring };
}

// ---- Consultation Queue ----
export async function getConsultationQueue(page = 1) {
  const skip = (page - 1) * PAGE_SIZE;

  const [consultations, total] = await Promise.all([
    db.consultation.findMany({
      where: {
        status: { in: ["submitted", "under_review", "action_required"] },
      },
      include: {
        user: {
          include: {
            customerProfile: {
              select: { firstName: true, lastName: true, dateOfBirth: true },
            },
          },
        },
        product: { select: { name: true } },
        answers: { select: { bmi: true } },
        uploads: { select: { id: true, status: true } },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            payments: {
              select: { captureBefore: true, status: true },
              take: 1,
            },
          },
          take: 1,
        },
      },
      orderBy: { submittedAt: "asc" },
      skip,
      take: PAGE_SIZE,
    }),
    db.consultation.count({
      where: {
        status: { in: ["submitted", "under_review", "action_required"] },
      },
    }),
  ]);

  return { consultations, total, pageSize: PAGE_SIZE, page };
}

// ---- Consultation Detail ----
export async function getConsultationDetail(id: string) {
  return db.consultation.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          customerProfile: true,
        },
      },
      product: { select: { id: true, name: true, slug: true } },
      productVariant: { select: { id: true, name: true, sku: true, priceMinor: true } },
      answers: true,
      uploads: true,
      reviews: {
        include: {
          prescriber: {
            include: {
              customerProfile: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      orders: {
        include: {
          payments: { select: { status: true, captureBefore: true, amountMinor: true } },
        },
        take: 1,
      },
    },
  });
}

// ---- Orders List ----
export async function getOrdersList(page = 1) {
  const skip = (page - 1) * PAGE_SIZE;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      include: {
        user: {
          include: {
            customerProfile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    db.order.count(),
  ]);

  return { orders, total, pageSize: PAGE_SIZE, page };
}

// ---- Order Detail ----
export async function getOrderDetail(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          customerProfile: true,
        },
      },
      items: {
        include: {
          product: { select: { name: true, slug: true } },
          productVariant: { select: { name: true, sku: true } },
        },
      },
      payments: true,
      consultation: {
        select: { id: true, status: true },
      },
      fulfillmentJob: true,
      shipments: {
        include: { trackingEvents: { orderBy: { occurredAt: "desc" } } },
      },
    },
  });
}

// ---- Fulfillment Queue ----
export async function getFulfillmentQueue(page = 1) {
  const skip = (page - 1) * PAGE_SIZE;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where: {
        paymentStatus: "captured",
        fulfillmentStatus: { in: ["ready_to_pack", "packed", "labels_created"] },
      },
      include: {
        user: {
          include: {
            customerProfile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        items: { select: { quantity: true } },
        fulfillmentJob: true,
        shipments: {
          select: { trackingNumber: true, status: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "asc" },
      skip,
      take: PAGE_SIZE,
    }),
    db.order.count({
      where: {
        paymentStatus: "captured",
        fulfillmentStatus: { in: ["ready_to_pack", "packed", "labels_created"] },
      },
    }),
  ]);

  return { orders, total, pageSize: PAGE_SIZE, page };
}

// ---- Audit Log for Entity ----
export async function getAuditLogForEntity(entityType: string, entityId: string) {
  return db.auditLog.findMany({
    where: { entityType, entityId },
    include: {
      actor: {
        include: {
          customerProfile: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

// ---- Status helpers ----
export function consultationStatusVariant(status: ConsultationStatus) {
  const map: Record<ConsultationStatus, "success" | "warning" | "danger" | "info" | "neutral" | "pending"> = {
    draft: "neutral",
    submitted: "pending",
    under_review: "info",
    action_required: "warning",
    approved: "success",
    rejected: "danger",
    expired: "neutral",
  };
  return map[status];
}

export function paymentStatusVariant(status: PaymentStatus) {
  const map: Record<PaymentStatus, "success" | "warning" | "danger" | "info" | "neutral" | "pending"> = {
    pending: "pending",
    authorized: "info",
    captured: "success",
    voided: "neutral",
    refunded: "warning",
    failed: "danger",
    expired: "danger",
  };
  return map[status];
}

export function fulfillmentStatusVariant(status: FulfillmentStatus) {
  const map: Record<FulfillmentStatus, "success" | "warning" | "danger" | "info" | "neutral" | "pending"> = {
    unfulfilled: "pending",
    ready_to_pack: "warning",
    packed: "info",
    labels_created: "info",
    collection_booked: "info",
    shipped: "success",
    delivered: "success",
  };
  return map[status];
}
