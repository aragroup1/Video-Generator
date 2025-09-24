import { videoQueue, shopifyQueue, tiktokQueue } from './config';
import { VideoType, AIProvider } from '@prisma/client';

export interface VideoGenerationJobData {
  jobId: string;
  projectId: string;
  productId: string;
  provider: AIProvider;
  videoType: VideoType;
  settings: {
    prompt?: string;
    duration?: number;
    aspectRatio?: string;
    quality?: string;
    style?: string;
  };
  images: string[];
}

export interface ShopifySyncJobData {
  projectId: string;
  shopifyUrl: string;
  accessToken: string;
}

export interface TikTokUploadJobData {
  videoId: string;
  projectId: string;
  caption: string;
  hashtags: string[];
}

export async function createVideoGenerationJob(data: VideoGenerationJobData) {
  return videoQueue.add('generate-video', data, {
    priority: data.provider === AIProvider.RUNWAY ? 1 : 2,
  });
}

export async function createShopifySyncJob(data: ShopifySyncJobData) {
  return shopifyQueue.add('sync-products', data);
}

export async function createTikTokUploadJob(data: TikTokUploadJobData) {
  return tiktokQueue.add('upload-video', data);
}

export async function retryJob(queueName: string, jobId: string) {
  let queue;
  switch (queueName) {
    case 'video-generation':
      queue = videoQueue;
      break;
    case 'shopify-sync':
      queue = shopifyQueue;
      break;
    case 'tiktok-upload':
      queue = tiktokQueue;
      break;
    default:
      throw new Error(`Unknown queue: ${queueName}`);
  }

  const job = await queue.getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  await job.retry();
  return job;
}
