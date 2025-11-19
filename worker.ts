import { Worker, Job } from 'bullmq';
import prisma from './lib/prisma';
import redis, { getRedisConnection } from './lib/redis';
import { ReplicateProvider } from './lib/ai-providers/replicate';
import { uploadVideoToS3 } from './lib/storage/s3';
import { JobStatus, AIProvider, VideoType } from '@prisma/client';
import axios from 'axios';

interface VideoJobData {
  jobId: string;
  productId: string;
  projectId: string;
  settings: {
    style: string;
    budget: string;
    model?: string;
    productTitle: string;
    productDescription: string;
    prompt?: string;
  };
}

// Process video generation job
async function processVideoGeneration(job: Job<VideoJobData>) {
  const { jobId, productId, projectId, settings } = job.data;

  console.log(`🔄 Processing job ${job.id}: generate-video`);
  console.log('📦 Job data:', { jobId, productId, projectId, model: settings.model });

  try {
    // Get job from database
    const videoJob = await prisma.videoJob.findUnique({
      where: { id: jobId },
      include: {
        product: true,
        project: true,
      },
    });

    if (!videoJob) {
      throw new Error('Job not found');
    }

    // Update status to processing
    await prisma.videoJob.update({
      where: { id: jobId },
      data: { 
        status: JobStatus.PROCESSING,
        startedAt: new Date(),
      },
    });

    // Get product images
    const images = videoJob.product.images as string[];
    if (!images || images.length === 0) {
      throw new Error('Product has no images');
    }

    // Get API key from project
    const apiKey = videoJob.project.replicateKey;
    if (!apiKey) {
      throw new Error('Replicate API key not configured');
    }

    // Initialize provider
    const provider = new ReplicateProvider({ apiKey });

    // Generate video with model preference
    console.log('🎬 Starting video generation...');
    const result = await provider.generateVideo({
      imageUrl: images[0],
      style: settings.style as any,
      budget: settings.budget as any,
      productTitle: settings.productTitle,
      productDescription: settings.productDescription || '',
      preferredModel: settings.model as any, // Pass model preference
    });

    console.log('✅ Video generated:', result.videoUrl);

    // Download video from Replicate
    console.log('📥 Downloading video from Replicate...');
    const videoResponse = await axios.get(result.videoUrl, {
      responseType: 'arraybuffer',
      timeout: 300000, // 5 minute timeout
    });

    const videoBuffer = Buffer.from(videoResponse.data);
    console.log(`📦 Video downloaded: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // Upload to S3
    console.log('☁️ Uploading to AWS S3...');
    const s3Url = await uploadVideoToS3({
      buffer: videoBuffer,
      productId,
      projectId,
      jobId,
      contentType: videoResponse.headers['content-type'] || 'video/mp4',
    });

    console.log('✅ Video uploaded to S3:', s3Url);

    // Create video record with S3 URL
    const video = await prisma.video.create({
      data: {
        projectId,
        productId,
        jobId,
        videoType: VideoType.PRODUCT_DEMO,
        fileUrl: s3Url, // Use S3 URL instead of Replicate URL
        fileSize: BigInt(videoBuffer.length),
        metadata: {
          ...settings,
          originalUrl: result.videoUrl,
          model: settings.model || 'auto',
          uploadedToS3: true,
        } as any,
      },
    });

    // Update job status to completed
    await prisma.videoJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMPLETED,
        completedAt: new Date(),
        resultUrl: s3Url, // Store S3 URL in job
        costCredits: Math.round(result.estimatedCost * 100),
      },
    });

    console.log(`✅ Job ${jobId} completed successfully`);
    return { success: true, videoId: video.id, s3Url };
  } catch (error: any) {
    console.error(`❌ Job ${jobId} failed:`, error.message);

    // Update job status to failed
    try {
      await prisma.videoJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.FAILED,
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });
    } catch (updateError) {
      console.error('Failed to update job status:', updateError);
    }

    throw error;
  }
}

// Create worker
async function startWorker() {
  if (!redis) {
    console.error('❌ Redis is not available. Worker cannot start.');
    process.exit(1);
  }

  const connection = getRedisConnection();
  if (!connection) {
    console.error('❌ Redis connection details not available. Worker cannot start.');
    process.exit(1);
  }

  const worker = new Worker(
    'video-generation',
    async (job: Job<VideoJobData>) => {
      return await processVideoGeneration(job);
    },
    {
      connection,
      concurrency: 2, // Reduced to 2 for S3 uploads
      limiter: {
        max: 10,
        duration: 60000,
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('❌ Worker error:', err);
  });

  console.log('🚀 Worker started and listening for jobs...');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('⏹️ Shutting down worker...');
    await worker.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('⏹️ Shutting down worker...');
    await worker.close();
    process.exit(0);
  });
}

// Start the worker
startWorker().catch((error) => {
  console.error('Failed to start worker:', error);
  process.exit(1);
});
