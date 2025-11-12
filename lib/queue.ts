import { Queue, Worker, Job } from 'bullmq';
import { getRedisConnection } from './redis';

const connection = getRedisConnection();

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
