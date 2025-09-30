import Redis from 'ioredis';

let redisClient: Redis | null = null;

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  throw new Error('REDIS_URL is not defined');
};

const createRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('error', (error) => {
      console.error('Redis Client Error:', error);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }
  return redisClient;
};

// Use a Proxy to delay initialization until first access
const redis = new Proxy({} as Redis, {
  get(target, prop) {
    const client = createRedisClient();
    return typeof client[prop as keyof Redis] === 'function'
      ? (client[prop as keyof Redis] as Function).bind(client)
      : client[prop as keyof Redis];
  },
});

export default redis;
