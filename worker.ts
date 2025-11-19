import { Worker, Job } from 'bullmq';
import prisma from './lib/prisma';
import redis, { getRedisConnection } from './lib/redis';
import { ReplicateProvider } from './lib/ai-providers/replicate';
import { JobStatus, AIProvider, VideoType } from '@prisma/client';

interface VideoJobData {
  jobId: string;
  productId: string;
  projectId: string;
  settings: {
    style: string;
    budget: string;
    productTitle: string;
    productDescription: string;
    prompt?: string;
  };
}

// Process video generation job
async function processVideoGeneration(job: Job<VideoJobData>) {
  const { jobId, productId, projectId, settings } = job.data;

  console.log(`🔄 Processing job ${job.id}: generate-video`);
  console.log('📦 Job data:', { jobId, productId, projectId });

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

    // Generate video
    console.log('🎬 Starting video generation...');
    const result = await provider.generateVideo({
      imageUrl: images[0],
      style: settings.style as any,
      budget: settings.budget as any,
      productTitle: settings.productTitle,
      productDescription: settings.productDescription || '',
    });

    console.log('✅ Video generated:', result.videoUrl);

    // Create video record
    const video = await prisma.video.create({
      data: {
        projectId,
        productId,
        jobId,
        videoType: VideoType.PRODUCT_DEMO,
        fileUrl: result.videoUrl,
        metadata: settings as any,
      },
    });

    // Update job status to completed
    await prisma.videoJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMPLETED,
        completedAt: new Date(),
        resultUrl: result.videoUrl,
        costCredits: Math.round(result.estimatedCost * 100),
      },
    });

    console.log(`✅ Job ${jobId} completed successfully`);
    return { success: true, videoId: video.id };
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
      concurrency: 3,
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
