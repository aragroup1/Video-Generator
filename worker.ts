import { createWorker } from './lib/queue';
import redis from './lib/redis';
import prisma from './lib/prisma';
import { AIProvider, JobStatus, VideoType } from '@prisma/client';
import { LumaProvider } from './lib/ai-providers/luma';
import { RunwayProvider } from './lib/ai-providers/runway';
import { PikaProvider } from './lib/ai-providers/pika';
import { ReplicateProvider } from './lib/ai-providers/replicate';

// Job data types
interface VideoGenerationJobData {
  jobId: string;
  productId: string;
  projectId: string;
  settings: any;
}

async function processVideoGeneration(data: VideoGenerationJobData) {
  const { jobId, productId, projectId, settings } = data;

  try {
    // Get job details
    const job = await prisma.videoJob.findUnique({
      where: { id: jobId },
      include: {
        product: true,
        project: true,
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Update status to processing
    await prisma.videoJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.PROCESSING,
        progress: 10,
      },
    });

    // Select AI provider
    let provider;
    switch (job.provider) {
      case AIProvider.LUMA:
        provider = new LumaProvider(job.project.lumaKey!);
        break;
      case AIProvider.RUNWAY:
        provider = new RunwayProvider(job.project.runwayKey!);
        break;
      case AIProvider.PIKA:
        provider = new PikaProvider(job.project.pikaKey!);
        break;
      case AIProvider.REPLICATE:
        provider = new ReplicateProvider(job.project.replicateKey!);
        break;
      default:
        throw new Error(`Unsupported provider: ${job.provider}`);
    }

    // Generate video
    await prisma.videoJob.update({
      where: { id: jobId },
      data: { progress: 30 },
    });

    const videoUrl = await provider.generateVideo({
      prompt: job.prompt || settings.prompt,
      imageUrl: job.product.images[0],
      duration: settings.duration || 5,
      aspectRatio: settings.aspectRatio || '9:16',
    });

    // Update progress
    await prisma.videoJob.update({
      where: { id: jobId },
      data: { progress: 80 },
    });

    // Create video record
    const video = await prisma.video.create({
      data: {
        projectId,
        productId,
        title: `${job.product.title} - ${job.jobType}`,
        url: videoUrl,
        thumbnailUrl: job.product.images[0],
        duration: settings.duration || 5,
        resolution: settings.aspectRatio || '9:16',
        status: 'COMPLETED',
        metadata: {
          provider: job.provider,
          jobType: job.jobType,
          settings,
        },
      },
    });

    // Mark job as completed
    await prisma.videoJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMPLETED,
        progress: 100,
        videoId: video.id,
        completedAt: new Date(),
      },
    });

    console.log(`✅ Job ${jobId} completed successfully`);
  } catch (error: any) {
    console.error(`❌ Job ${jobId} failed:`, error);

    await prisma.videoJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FAILED,
        errorMessage: error.message,
        completedAt: new Date(),
      },
    });

    throw error;
  }
}

// Create worker
const worker = createWorker(async (job) => {
  console.log(`🔄 Processing job ${job.id}:`, job.name);

  switch (job.name) {
    case 'generate-video':
      await processVideoGeneration(job.data as VideoGenerationJobData);
      break;
    default:
      console.warn(`Unknown job type: ${job.name}`);
  }
});

if (worker) {
  console.log('🚀 Worker started and listening for jobs...');

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });
} else {
  console.warn('⚠️ Worker not started - Redis not available');
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down worker...');
  if (worker) {
    await worker.close();
  }
  if (redis) {
    await redis.quit();
  }
  process.exit(0);
});
