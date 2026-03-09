import { db } from "@/lib/db";
import { createPresignedUploadUrl } from "@/lib/uploads/s3";
import { writeAuditLog } from "@/lib/security/audit";
import type { UploadType } from "@/generated/prisma/client";
import { z } from "zod";

const presignSchema = z.object({
  consultationId: z.string().uuid(),
  fileName: z.string().min(1).max(255),
  mimeType: z.string().regex(/^image\/(jpeg|png|webp)$/),
  fileSizeBytes: z.number().int().min(1).max(10 * 1024 * 1024), // 10MB
  uploadType: z.enum(["body_photo_front", "body_photo_side", "photo_id"]),
});

interface PresignResult {
  success: boolean;
  uploadUrl?: string;
  uploadId?: string;
  error?: string;
}

/**
 * Create a presigned upload URL, scoped to user + consultation.
 * Verifies ownership before issuing the URL.
 */
export async function requestPresignedUpload(
  userId: string,
  input: z.infer<typeof presignSchema>
): Promise<PresignResult> {
  const parsed = presignSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid upload request." };
  }

  const data = parsed.data;

  // Verify consultation belongs to this user
  const consultation = await db.consultation.findFirst({
    where: { id: data.consultationId, userId },
    select: { id: true, status: true },
  });

  if (!consultation) {
    return { success: false, error: "Consultation not found." };
  }

  // Only allow uploads for action_required or submitted consultations
  if (
    consultation.status !== "action_required" &&
    consultation.status !== "submitted"
  ) {
    return { success: false, error: "Uploads not accepted for this consultation." };
  }

  const { url, key } = await createPresignedUploadUrl({
    userId,
    consultationId: data.consultationId,
    fileName: data.fileName,
    mimeType: data.mimeType,
  });

  // Create upload record
  const upload = await db.consultationUpload.create({
    data: {
      consultationId: data.consultationId,
      userId,
      storageKey: key,
      fileName: data.fileName,
      mimeType: data.mimeType,
      fileSizeBytes: data.fileSizeBytes,
      uploadType: data.uploadType as UploadType,
      status: "requested",
    },
  });

  await writeAuditLog({
    actorUserId: userId,
    actorRole: "customer",
    entityType: "ConsultationUpload",
    entityId: upload.id,
    action: "upload.presigned",
    newState: { uploadType: data.uploadType, fileName: data.fileName },
  });

  return { success: true, uploadUrl: url, uploadId: upload.id };
}

/**
 * Mark an upload as completed (called after client confirms upload to S3).
 */
export async function confirmUpload(
  userId: string,
  uploadId: string
): Promise<{ success: boolean; error?: string }> {
  const upload = await db.consultationUpload.findFirst({
    where: { id: uploadId, userId },
  });

  if (!upload) {
    return { success: false, error: "Upload not found." };
  }

  if (upload.status !== "requested") {
    return { success: false, error: "Upload already processed." };
  }

  await db.consultationUpload.update({
    where: { id: uploadId },
    data: { status: "uploaded", uploadedAt: new Date() },
  });

  return { success: true };
}
