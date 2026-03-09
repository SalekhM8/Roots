import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { confirmUpload } from "@/server/services/upload";

/**
 * POST /api/uploads/confirm
 * Called after client successfully uploads to S3.
 */
export async function POST(req: Request) {
  const user = await requireUser();
  const { uploadId } = await req.json();

  if (!uploadId || typeof uploadId !== "string") {
    return NextResponse.json({ error: "Invalid upload ID" }, { status: 400 });
  }

  const result = await confirmUpload(user.id, uploadId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
