import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './services/cache.service';
import { RateLimitService } from './services/rate-limit.service';
import { redisConfig } from '../config/redis.config';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(redisConfig),
  ],
  providers: [
    CacheService,
    RateLimitService,
  ],
  exports: [
    CacheService,
    RateLimitService,
  ],
})
export class CommonModule {} 