import Redis from 'ioredis';

let redisClient: Redis | null = null;

const getRedisUrl = () => {
  return process.env.REDIS_URL || null;
};

const createRedisClient = () => {
  const redisUrl = getRedisUrl();
  
  // If no Redis URL, return a mock client that logs warnings
  if (!redisUrl) {
    console.warn('REDIS_URL is not defined - Redis features will be disabled');
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(redisUrl, {
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

// Create a mock Redis client for when Redis is not available
const createMockRedisClient = () => {
  return {
    ping: async () => {
      throw new Error('Redis is not configured');
    },
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    disconnect: () => {},
    quit: () => Promise.resolve('OK'),
  } as any;
};

// Use a Proxy to delay initialization until first access
const redis = new Proxy({} as Redis, {
  get(target, prop) {
    const client = createRedisClient();
    
    // If no Redis client (Redis not configured), return mock
    if (!client) {
      const mockClient = createMockRedisClient();
      return typeof mockClient[prop as keyof typeof mockClient] === 'function'
        ? (mockClient[prop as keyof typeof mockClient] as Function).bind(mockClient)
        : mockClient[prop as keyof typeof mockClient];
    }
    
    return typeof client[prop as keyof Redis] === 'function'
      ? (client[prop as keyof Redis] as Function).bind(client)
      : client[prop as keyof Redis];
  },
});

export default redis;
export { redisClient };
