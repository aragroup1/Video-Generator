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

// Only create queues if Redis is configured
const isRedisConfigured = () => !!process.env.REDIS_URL;

export const videoQueue = isRedisConfigured() 
  ? new Queue(VIDEO_QUEUE_NAME, {
      connection: redis,
      defaultJobOptions,
    })
  : null as any;

export const shopifyQueue = isRedisConfigured()
  ? new Queue(SHOPIFY_QUEUE_NAME, {
      connection: redis,
      defaultJobOptions,
    })
  : null as any;

export const tiktokQueue = isRedisConfigured()
  ? new Queue(TIKTOK_QUEUE_NAME, {
      connection: redis,
      defaultJobOptions,
    })
  : null as any;

export const videoQueueEvents = isRedisConfigured()
  ? new QueueEvents(VIDEO_QUEUE_NAME, {
      connection: redis,
    })
  : null as any;

export const shopifyQueueEvents = isRedisConfigured()
  ? new QueueEvents(SHOPIFY_QUEUE_NAME, {
      connection: redis,
    })
  : null as any;
