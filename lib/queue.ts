import { Queue, Worker, Job } from 'bullmq';
import redis, { isRedisAvailable } from './redis';

const connection = redis ? {
  host: redis.options.host,
  port: redis.options.port,
} : undefined;

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
```

### **Check Redis Configuration in Railway:**

1. Go to your Railway project
2. Click on the Redis service
3. Go to **Variables** tab
4. Look for these variables:
   - `REDIS_URL` (should be like `redis://default:password@redis.railway.internal:6379`)
   - `REDIS_PRIVATE_URL` (internal network)
   - `REDIS_PUBLIC_URL` (external access)

5. **Copy the `REDIS_PRIVATE_URL`** and add it to your **main app service** as `REDIS_URL`

The issue is that your app might be using a reference variable that isn't properly linked. Try:

**Option 1: Use the private URL directly**
```
REDIS_URL=redis://default:PASSWORD@redis.railway.internal:6379
```

**Option 2: Use Redis public URL temporarily**
```
REDIS_URL=redis://default:PASSWORD@XXXX.railway.app:6379
