import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'ai-video-dashboard';

export async function uploadVideo(
  buffer: Buffer,
  key: string,
  contentType = 'video/mp4'
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
}

export async function uploadImage(
  buffer: Buffer,
  key: string,
  options?: {
    resize?: { width: number; height: number };
    quality?: number;
  }
): Promise<string> {
  let processedBuffer = buffer;

  if (options?.resize) {
    processedBuffer = await sharp(buffer)
      .resize(options.resize.width, options.resize.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: options.quality || 80 })
      .toBuffer();
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: processedBuffer,
    ContentType: 'image/jpeg',
  });

  await s3Client.send(command);
  
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
}

export async function generateThumbnail(
  videoUrl: string,
  key: string
): Promise<string> {
  // In production, you would extract a frame from the video
  // For now, we'll return a placeholder
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
}

export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}
