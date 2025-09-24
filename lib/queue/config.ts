import { Queue, Worker, QueueEvents } from 'bullmq';
import redis from '../redis';

export const VIDEO_QUEUE_NAME = 'video-generation';
export const SHOPIFY_QUEUE_NAME = 'shopify-sync';
export const TIKTOK_QUEUE_NAME = 'tiktok-upload';

export const defaultJobOptions = {
  removeOnComplete: {
    age: 3600, // 1 hour
    count: 100,
  },
  removeOnFail: {
    age: 86400, // 24 hours
    count: 500,
  },
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 2000,
  },
};

export const videoQueue = new Queue(VIDEO_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions,
});

export const shopifyQueue = new Queue(SHOPIFY_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions,
});

export const tiktokQueue = new Queue(TIKTOK_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions,
});

export const videoQueueEvents = new QueueEvents(VIDEO_QUEUE_NAME, {
  connection: redis,
});

export const shopifyQueueEvents = new QueueEvents(SHOPIFY_QUEUE_NAME, {
  connection: redis,
});
