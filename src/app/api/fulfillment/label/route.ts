import { NextRequest, NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/auth";
import { db } from "@/lib/db";

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

  // Find the shipment with click drop order ID
  const shipment = await db.shipment.findFirst({
    where: { orderId },
    select: { clickDropOrderId: true, labelUrl: true },
  });

  if (!shipment?.clickDropOrderId) {
    return NextResponse.json(
      { error: "No Click & Drop order found for this order." },
      { status: 404 }
    );
  }

  // If we have a stored label URL, redirect to it
  if (shipment.labelUrl) {
    return NextResponse.redirect(shipment.labelUrl);
  }

  // Otherwise proxy the label PDF from Click & Drop
  const apiKey = process.env.CLICK_DROP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "CLICK_DROP_API_KEY not configured" },
      { status: 500 }
    );
  }

  const labelResponse = await fetch(
    `https://api.parcel.royalmail.com/api/v1/Orders/${shipment.clickDropOrderId}/label`,
    {
      headers: {
        Authorization: apiKey,
        Accept: "application/pdf",
      },
    }
  );

  if (!labelResponse.ok) {
    // Try fetching order details for a label URL
    const detailsResponse = await fetch(
      `https://api.parcel.royalmail.com/api/v1/Orders/${shipment.clickDropOrderId}`,
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (detailsResponse.ok) {
      const details = await detailsResponse.json();
      const url = details.label?.url ?? details.labelUrl ?? details.printLabelUrl;
      if (url) {
        // Store for future use
        await db.shipment.updateMany({
          where: { orderId },
          data: { labelUrl: url },
        });
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.json(
      {
        error: "Label not available yet. You can print labels directly from your Royal Mail Click & Drop dashboard at parcel.royalmail.com",
      },
      { status: 404 }
    );
  }

  // Stream the PDF back
  const pdfBuffer = await labelResponse.arrayBuffer();
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="label-${orderId}.pdf"`,
    },
  });
}
