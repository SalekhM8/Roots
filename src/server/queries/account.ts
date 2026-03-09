import { db } from "@/lib/db";

const PAGE_SIZE = 25;

// ---- Customer Orders ----
export async function getCustomerOrders(userId: string, page = 1) {
  const skip = (page - 1) * PAGE_SIZE;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where: { userId },
      include: {
        items: {
          select: {
            productNameSnapshot: true,
            variantNameSnapshot: true,
            quantity: true,
            unitPriceMinor: true,
            lineTotalMinor: true,
          },
        },
        payments: {
          select: { status: true },
          take: 1,
        },
        shipments: {
          select: { trackingNumber: true, trackingUrl: true, status: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    db.order.count({ where: { userId } }),
  ]);

  return { orders, total, pageSize: PAGE_SIZE, page };
}

// ---- Customer Order Detail ----
export async function getCustomerOrderDetail(userId: string, orderId: string) {
  return db.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          product: { select: { slug: true } },
        },
      },
      payments: {
        select: { status: true, amountMinor: true, captureBefore: true },
      },
      shipments: {
        include: { trackingEvents: { orderBy: { occurredAt: "desc" } } },
      },
      consultation: {
        select: { id: true, status: true },
      },
    },
  });
}

// ---- Customer Consultations ----
export async function getCustomerConsultations(userId: string, page = 1) {
  const skip = (page - 1) * PAGE_SIZE;

  const [consultations, total] = await Promise.all([
    db.consultation.findMany({
      where: { userId },
      include: {
        product: { select: { name: true, slug: true } },
        productVariant: { select: { name: true } },
        reviews: {
          select: { decision: true, customerMessage: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    db.consultation.count({ where: { userId } }),
  ]);

  return { consultations, total, pageSize: PAGE_SIZE, page };
}

// ---- Customer Consultation Detail ----
export async function getCustomerConsultationDetail(userId: string, consultationId: string) {
  return db.consultation.findFirst({
    where: { id: consultationId, userId },
    include: {
      product: { select: { name: true, slug: true } },
      productVariant: { select: { name: true, priceMinor: true } },
      answers: true,
      uploads: {
        select: { id: true, uploadType: true, status: true, fileName: true },
      },
      reviews: {
        select: {
          decision: true,
          customerMessage: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      orders: {
        select: { id: true, orderNumber: true, paymentStatus: true },
        take: 1,
      },
      prescriptions: {
        select: { referenceCode: true, directions: true, issuedAt: true },
        take: 1,
      },
    },
  });
}

// ---- Customer Profile ----
export async function getCustomerProfile(userId: string) {
  return db.customerProfile.findUnique({
    where: { userId },
  });
}

// ---- Customer Addresses ----
export async function getCustomerAddresses(userId: string) {
  return db.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
