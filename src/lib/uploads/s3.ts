import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _s3: S3Client | null = null;

function getS3(): S3Client {
  if (!_s3) {
    _s3 = new S3Client({
      region: process.env.AWS_REGION ?? "eu-west-2",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
      },
    });
  }
  return _s3;
}

const BUCKET = process.env.S3_UPLOAD_BUCKET ?? "roots-uploads";

/**
 * Sanitise a user-supplied filename for use inside an S3 key.
 *
 * S3 doesn't have a filesystem so "../" isn't a path-traversal vuln per se,
 * but it lets a malicious upload write to e.g.
 * `consultations/<other-consultation-id>/...` once you decode the key.
 * Strip slashes, dot-segments, backslashes, control chars, and cap length.
 */
function sanitizeFileName(raw: string): string {
  const stripped = raw
    // Drop any path separators a client might send
    .replace(/[\\/]+/g, "_")
    // Drop dot-segments so "..%2F" decodes to "_" rather than ".."
    .replace(/\.{2,}/g, "_")
    // Drop control chars + anything non-printable
    .replace(/[\x00-\x1f\x7f]/g, "")
    .trim();
  const safe = stripped.length > 0 ? stripped : "upload";
  // Cap length — S3 key limit is 1024 bytes but our prefix already takes ~100.
  return safe.slice(0, 200);
}

/**
 * Generate a presigned PUT URL for uploading a file.
 * Key is scoped to user + consultation for security.
 */
export async function createPresignedUploadUrl(params: {
  userId: string;
  consultationId: string;
  fileName: string;
  mimeType: string;
}): Promise<{ url: string; key: string }> {
  const safeName = sanitizeFileName(params.fileName);
  const key = `consultations/${params.consultationId}/${params.userId}/${Date.now()}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: params.mimeType,
  });

  // 15 min — gives slow mobile connections time to PUT a 10MB photo without
  // the URL expiring mid-upload. Short enough that a leaked URL has minimal value.
  const url = await getSignedUrl(getS3(), command, { expiresIn: 900 });

  return { url, key };
}

/**
 * Generate a presigned GET URL for viewing an upload (admin/prescriber).
 */
export async function createPresignedViewUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(getS3(), command, { expiresIn: 600 }); // 10 min
}
