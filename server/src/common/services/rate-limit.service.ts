import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface RateLimitConfig {
  points: number;      // Number of requests allowed
  duration: number;    // Time window in seconds
  blockDuration?: number; // Duration to block if limit exceeded (optional)
}

@Injectable()
export class RateLimitService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(RateLimitService.name);
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  // Default rate limits for different tiers
  private readonly limits = {
    default: { points: 60, duration: 60 },     // 60 requests per minute
    authenticated: { points: 120, duration: 60 }, // 120 requests per minute
    premium: { points: 300, duration: 60 },    // 300 requests per minute
  };

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('redis.host'),
      port: this.configService.get('redis.port'),
      password: this.configService.get('redis.password'),
      keyPrefix: 'ratelimit:',
      retryStrategy: (times) => {
        this.reconnectAttempts = times;
        if (times > this.maxReconnectAttempts) {
          this.logger.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached`);
          return null; // stop retrying
        }
        const delay = Math.min(times * 200, 2000);
        this.logger.warn(`Retrying Redis connection in ${delay}ms... (attempt ${times})`);
        return delay;
      },
    });

    this.redis.on('error', (error: Error & { code?: string }) => {
      this.isConnected = false;
      if (error.code !== 'ECONNREFUSED') {
        this.logger.error('Redis connection error:', error);
      }
    });

    this.redis.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.logger.log('Successfully connected to Redis');
    });
  }

  async onModuleInit() {
    try {
      await this.redis.ping();
      this.isConnected = true;
      this.logger.log('Redis connection verified');
    } catch (error) {
      this.logger.error('Failed to connect to Redis during initialization:', error);
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
      this.logger.log('Redis connection closed');
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  async consume(identifier: string, config: RateLimitConfig = this.limits.default): Promise<boolean> {
    if (!this.isConnected) {
      return true; // Fail open if Redis is down
    }

    const key = `${identifier}`;
    const now = Math.floor(Date.now() / 1000);

    try {
      // Clean old records and get current count
      const cleanupCmd = `
        local cleanup = redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1])
        return redis.call('ZCARD', KEYS[1])
      `;
      
      const count = await this.redis.eval(
        cleanupCmd,
        1,
        key,
        now - config.duration
      ) as number;

      if (count >= config.points) {
        if (config.blockDuration) {
          await this.redis.set(`blocked:${key}`, '1', 'EX', config.blockDuration);
        }
        return false;
      }

      // Add new record
      await this.redis.zadd(key, now, `${now}-${Math.random()}`);
      await this.redis.expire(key, config.duration);
      
      return true;
    } catch (error) {
      this.logger.error(`Error in rate limit check for ${identifier}:`, error);
      return true; // Fail open if Redis is down
    }
  }

  async isBlocked(identifier: string): Promise<boolean> {
    if (!this.isConnected) {
      return false; // Fail open if Redis is down
    }

    try {
      return Boolean(await this.redis.exists(`blocked:${identifier}`));
    } catch (error) {
      this.logger.error(`Error checking blocked status for ${identifier}:`, error);
      return false; // Fail open if Redis is down
    }
  }

  async getRemainingPoints(identifier: string, config: RateLimitConfig = this.limits.default): Promise<number> {
    if (!this.isConnected) {
      return config.points; // Fail open if Redis is down
    }

    const key = `${identifier}`;
    const now = Math.floor(Date.now() / 1000);

    try {
      const count = await this.redis.zcount(key, now - config.duration, '+inf');
      return Math.max(0, config.points - count);
    } catch (error) {
      this.logger.error(`Error getting remaining points for ${identifier}:`, error);
      return config.points; // Fail open if Redis is down
    }
  }

  async reset(identifier: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await Promise.all([
        this.redis.del(`${identifier}`),
        this.redis.del(`blocked:${identifier}`)
      ]);
    } catch (error) {
      this.logger.error(`Error resetting rate limit for ${identifier}:`, error);
    }
  }
} 