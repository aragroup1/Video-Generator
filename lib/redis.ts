import Redis from 'ioredis';

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  throw new Error('REDIS_URL is not defined');
};

export const redis = new Redis(getRedisUrl(), {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (error) => {
  console.error('Redis Client Error:', error);
});

redis.on('connect', () => {
  console.log('Redis Client Connected');
});

export default redis;
