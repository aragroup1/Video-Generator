import Redis from 'ioredis';

let redis: Redis | null = null;

try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('Redis connection failed after 3 retries. Running without Redis.');
          return null; // Stop retrying
        }
        return Math.min(times * 100, 2000);
      },
      lazyConnect: true, // Don't connect immediately
    });

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    // Try to connect but don't wait for it
    redis.connect().catch((err) => {
      console.warn('Redis connection failed:', err.message);
      redis = null;
    });
  } else {
    console.warn('REDIS_URL not configured. Job queue features will be disabled.');
  }
} catch (error) {
  console.error('Failed to initialize Redis:', error);
  redis = null;
}

export default redis;

export const isRedisAvailable = () => redis !== null && redis.status === 'ready';
