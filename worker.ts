import { Worker, Job } from 'bullmq';
import redis from './lib/redis';
import prisma from './lib/prisma';
import { VideoGenerationJobData, ShopifySyncJobData, TikTokUploadJobData } from './lib/queue/jobs';
import { AIProvider, JobStatus, VideoType } from '@prisma/client';
import { LumaProvider } from './lib/ai-providers/luma';
import { RunwayProvider } from './lib/ai-providers/runway';
import { PikaProvider } from './lib/ai-providers/pika';
import { ShopifyClient } from './lib/shopify/client';
import { uploadVideo, generateThumbnail } from './lib/storage/s3';
import { VIDEO_QUEUE_NAME, SHOPIFY_QUEUE_NAME, TIKTOK_QUEUE_NAME } from './lib/queue/config';

// Video Generation Worker
const videoWorker = new Worker<VideoGenerationJobData>(
  VIDEO_QUEUE_NAME,
  async (job: Job<VideoGenerationJobData>) => {
    const { jobId, projectId, productId, provider, videoType, settings, images } = job.data;

    try {
      // Update job status to processing
      await prisma.videoJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.PROCESSING,
          startedAt: new Date(),
          progress: 10,
        },
      });

      await job.updateProgress(10);

      // Get project to fetch API keys
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // Initialize AI provider
      let aiProvider;
      let apiKey: string | null = null;

      switch (provider) {
        case AIProvider.LUMA:
          apiKey = project.lumaKey;
          if (!apiKey) throw new Error('Luma API key not configured');
          aiProvider = new LumaProvider({ apiKey });
          break;
        case AIProvider.RUNWAY:
          apiKey = project.runwayKey;
          if (!apiKey) throw new Error('Runway API key not configured');
          aiProvider = new RunwayProvider({ apiKey });
          break;
        case AIProvider.PIKA:
          apiKey = project.pikaKey;
          if (!apiKey) throw new Error('Pika API key not configured');
          aiProvider = new PikaProvider({ apiKey });
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      await job.updateProgress(20);

      // Generate video
      const generationResponse = await aiProvider.generateVideo({
        imageUrl: images[0],
        prompt: settings.prompt,
        duration: settings.duration,
        aspectRatio: settings.aspectRatio as any,
        quality: settings.quality as any,
        style: settings.style,
      });

      await prisma.videoJob.update({
        where: { id: jobId },
        data: { progress: 30 },
      });

      await job.updateProgress(30);

      // Poll for completion
      let isCompleted = false;
      let progress = 30;
      let finalStatus;

      while (!isCompleted) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

        finalStatus = await aiProvider.checkStatus(generationResponse.jobId);
        
        if (finalStatus.status === 'completed') {
          isCompleted = true;
          progress = 90;
        } else if (finalStatus.status === 'failed') {
          throw new Error(finalStatus.error || 'Video generation failed');
        } else {
          progress = Math.min(80, progress + 10);
        }

        await prisma.videoJob.update({
          where: { id: jobId },
          data: { progress },
        });

        await job.updateProgress(progress);
      }

      // Download video
      const videoBuffer = await aiProvider.downloadVideo(generationResponse.jobId);
      
      await job.updateProgress(95);

      // Upload to S3
      const videoKey = `videos/${projectId}/${jobId}.mp4`;
      const videoUrl = await uploadVideo(videoBuffer, videoKey);

      // Generate thumbnail
      const thumbnailKey = `thumbnails/${projectId}/${jobId}.jpg`;
      const thumbnailUrl = await generateThumbnail(videoUrl, thumbnailKey);

      // Create video record
      const video = await prisma.video.create({
        data: {
          projectId,
          productId,
          jobId,
          videoType,
          fileUrl: videoUrl,
          thumbnailUrl,
          duration: settings.duration,
          fileSize: BigInt(videoBuffer.length),
          metadata: {
            provider,
            settings,
            generationId: generationResponse.jobId,
          },
        },
      });

      // Update job status
      await prisma.videoJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.COMPLETED,
          resultUrl: videoUrl,
          completedAt: new Date(),
          progress: 100,
          costCredits: Math.ceil((settings.duration || 5) * 10), // Example credit calculation
        },
      });

      await job.updateProgress(100);

      return { success: true, videoId: video.id, videoUrl };
    } catch (error: any) {
      console.error('Video generation error:', error);

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
  },
  {
    connection: redis,
    concurrency: 3,
  }
);

// Shopify Sync Worker
const shopifyWorker = new Worker<ShopifySyncJobData>(
  SHOPIFY_QUEUE_NAME,
  async (job: Job<ShopifySyncJobData>) => {
    const { projectId, shopifyUrl, accessToken } = job.data;

    try {
      const client = new ShopifyClient(shopifyUrl, accessToken);
      
      let pageInfo: string | undefined;
      let totalSynced = 0;

      do {
        const { products, pageInfo: nextPageInfo } = await client.getProducts(50, pageInfo);
        
        for (const product of products) {
          await prisma.product.upsert({
            where: {
              projectId_shopifyId: {
                projectId,
                shopifyId: product.id,
              },
            },
            update: {
              title: product.title,
              description: product.body_html,
              images: product.images.map(img => img.src),
              tags: product.tags.split(',').map(tag => tag.trim()),
              price: product.variants[0]?.price ? parseFloat(product.variants[0].price) : null,
            },
            create: {
              projectId,
              shopifyId: product.id,
              title: product.title,
              description: product.body_html,
              images: product.images.map(img => img.src),
              category: product.product_type,
              tags: product.tags.split(',').map(tag => tag.trim()),
              price: product.variants[0]?.price ? parseFloat(product.variants[0].price) : null,
            },
          });

          totalSynced++;
        }

        pageInfo = nextPageInfo;
        await job.updateProgress((totalSynced / 100) * 100); // Approximate progress
      } while (pageInfo);

      return { success: true, totalSynced };
    } catch (error: any) {
      console.error('Shopify sync error:', error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 2,
  }
);

// TikTok Upload Worker (Placeholder)
const tiktokWorker = new Worker<TikTokUploadJobData>(
  TIKTOK_QUEUE_NAME,
  async (job: Job<TikTokUploadJobData>) => {
    const { videoId, projectId, caption, hashtags } = job.data;

    // TikTok API integration would go here
    // For now, just mark as published
    await prisma.video.update({
      where: { id: videoId },
      data: {
        isPublished: true,
        tiktokPostId: `tiktok_${Date.now()}`,
      },
    });

    return { success: true };
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

// Worker health check
videoWorker.on('completed', (job) => {
  console.log(`Video job ${job.id} completed`);
});

videoWorker.on('failed', (job, err) => {
  console.error(`Video job ${job?.id} failed:`, err);
});

shopifyWorker.on('completed', (job) => {
  console.log(`Shopify sync job ${job.id} completed`);
});

shopifyWorker.on('failed', (job, err) => {
  console.error(`Shopify sync job ${job?.id} failed:`, err);
});

console.log('Workers started successfully');
