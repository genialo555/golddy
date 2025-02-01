import { registerAs } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export const redisConfig = registerAs('redis', (): RedisOptions => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  password: process.env.REDIS_PASSWORD ?? undefined,
  keyPrefix: 'golddy:',
  retryStrategy: (times: number) => {
    // Maximum wait time is 2 seconds
    return Math.min(times * 50, 2000);
  },
  maxRetriesPerRequest: 3,
})); 