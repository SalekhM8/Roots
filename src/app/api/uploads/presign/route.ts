import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requestPresignedUpload } from "@/server/services/upload";
import { checkRateLimit } from "@/lib/security/rate-limit";

/**
 * POST /api/uploads/presign
 * Returns a presigned S3 upload URL for consultation uploads.
 */
export async function POST(req: Request) {
  const user = await requireUser();

  const rl = checkRateLimit("upload", user.id);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const body = await req.json();

  const result = await requestPresignedUpload(user.id, body);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    uploadUrl: result.uploadUrl,
    uploadId: result.uploadId,
  });
}
