import Redis from 'ioredis';

let redis: Redis | null = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) {
        return null;
      }
      return Math.min(times * 100, 2000);
    },
  });

  redis.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });
}

export default redis;

export const getRedisConnection = () => {
  if (!redis) return undefined;
  return {
    host: redis.options.host,
    port: redis.options.port,
  };
};

export const isRedisAvailable = () => redis !== null && redis.status === 'ready';
