import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

let redis: Redis | null = null;
let connection: { host?: string; port?: number } | undefined;

try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('Redis connection failed after 3 retries. Running without Redis.');
          return null;
        }
        return Math.min(times * 100, 2000);
      },
    });

    connection = {
      host: redis.options.host,
      port: redis.options.port,
    };

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });
  } else {
    console.warn('REDIS_URL not configured. Job queue features will be disabled.');
  }
} catch (error) {
  console.error('Failed to initialize Redis:', error);
  redis = null;
  connection = undefined;
}

export const videoQueue = connection ? new Queue('video-generation', { connection }) : null;

export function addVideoJob(jobData: any) {
  if (!videoQueue) {
    throw new Error('Redis is not configured. Please set REDIS_URL environment variable to enable job queue features.');
  }
  return videoQueue.add('generate-video', jobData);
}

export function createWorker(processor: (job: Job) => Promise<any>) {
  if (!connection) {
    console.warn('Cannot create worker: Redis not available');
    return null;
  }
  return new Worker('video-generation', processor, { connection });
}

export function getQueueStatus() {
  if (!videoQueue) {
    return { available: false, message: 'Redis not configured' };
  }
  return { available: true, queue: videoQueue };
}

export const isRedisAvailable = () => redis !== null && redis.status === 'ready';
