import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

interface UploadVideoOptions {
  buffer: Buffer;
  productId: string;
  projectId: string;
  jobId: string;
  contentType: string;
}

export async function uploadVideoToS3(options: UploadVideoOptions): Promise<string> {
  const { buffer, productId, projectId, jobId, contentType } = options;

  const bucketName = process.env.AWS_S3_BUCKET;
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET environment variable is not set');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const filename = `videos/${projectId}/${productId}/${jobId}_${timestamp}.mp4`;

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    // Return public URL
    const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${filename}`;
    
    console.log('✅ Video uploaded to S3:', s3Url);
    return s3Url;
  } catch (error: any) {
    console.error('❌ S3 upload failed:', error);
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
}
