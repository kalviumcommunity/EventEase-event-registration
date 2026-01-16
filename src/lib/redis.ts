import Redis from 'ioredis';

declare global {
  var redis: Redis | undefined;
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redis: Redis;

if (process.env.NODE_ENV === 'production') {
  redis = new Redis(redisUrl);
} else {
  if (!global.redis) {
    global.redis = new Redis(redisUrl);
  }
  redis = global.redis;
}

// Basic error handling
redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

export default redis;
