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
 * Generate a presigned PUT URL for uploading a file.
 * Key is scoped to user + consultation for security.
 */
export async function createPresignedUploadUrl(params: {
  userId: string;
  consultationId: string;
  fileName: string;
  mimeType: string;
}): Promise<{ url: string; key: string }> {
  const key = `consultations/${params.consultationId}/${params.userId}/${Date.now()}-${params.fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: params.mimeType,
  });

  const url = await getSignedUrl(getS3(), command, { expiresIn: 300 }); // 5 min

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
