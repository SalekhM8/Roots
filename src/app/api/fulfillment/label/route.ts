import { NextRequest, NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getClickDropLabelPdf } from "@/lib/shipping/click-drop";

/**
 * GET /api/fulfillment/label?orderId=xxx
 *
 * Proxies the Click & Drop label PDF for a given order.
 * Requires admin or prescriber role.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAnyRole("admin", "prescriber");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const shipment = await db.shipment.findFirst({
    where: { orderId },
    select: { clickDropOrderId: true },
  });

  if (!shipment?.clickDropOrderId) {
    return NextResponse.json(
      { error: "No Click & Drop order found for this order." },
      { status: 404 }
    );
  }

  const pdfBuffer = await getClickDropLabelPdf(shipment.clickDropOrderId);

  if (!pdfBuffer) {
    return NextResponse.json(
      {
        error:
          "Label not available yet. You can print labels directly from your Royal Mail Click & Drop dashboard at parcel.royalmail.com",
      },
      { status: 404 }
    );
  }

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="label-${orderId}.pdf"`,
    },
  });
}
