import Redis from 'ioredis';

let redis: Redis | null = null;

if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 100, 2000);
      },
      lazyConnect: false,
    });

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redis.on('ready', () => {
      console.log('✅ Redis is ready');
    });
  } catch (error: any) {
    console.error('Failed to initialize Redis:', error.message);
    redis = null;
  }
} else {
  console.warn('REDIS_URL not configured. Job queue features will be disabled.');
}

export default redis;

export const getRedisConnection = () => {
  if (!redis) return undefined;
  return {
    host: redis.options.host,
    port: redis.options.port,
    password: redis.options.password,
  };
};

export const isRedisAvailable = () => redis !== null && redis.status === 'ready';
