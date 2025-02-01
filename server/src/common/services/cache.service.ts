import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL = 3600; // 1 hour in seconds
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('redis.host'),
      port: this.configService.get('redis.port'),
      password: this.configService.get('redis.password'),
      keyPrefix: this.configService.get('redis.keyPrefix'),
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

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      return null;
    }

    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  async clearPattern(pattern: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Error clearing cache pattern ${pattern}:`, error);
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T | null> {
    if (!this.isConnected) {
      try {
        return await fetchFn();
      } catch (error) {
        this.logger.error(`Error in fetchFn for key ${key}:`, error);
        return null;
      }
    }

    try {
      const cachedValue = await this.get<T>(key);
      if (cachedValue) {
        return cachedValue;
      }

      const freshValue = await fetchFn();
      await this.set(key, freshValue, ttl);
      return freshValue;
    } catch (error) {
      this.logger.error(`Error in getOrSet for key ${key}:`, error);
      return null;
    }
  }
} 