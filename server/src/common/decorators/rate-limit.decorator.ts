import { SetMetadata } from '@nestjs/common';
import { RATE_LIMIT_KEY, RateLimitMetadata } from '../guards/rate-limit.guard';

export const RateLimit = (metadata: RateLimitMetadata) => SetMetadata(RATE_LIMIT_KEY, metadata);

// Convenience decorators for common rate limits
export const PublicRateLimit = () =>
  RateLimit({
    points: 60,
    duration: 60, // 60 requests per minute
    errorMessage: 'Rate limit exceeded for public API',
  });

export const AuthenticatedRateLimit = () =>
  RateLimit({
    points: 120,
    duration: 60, // 120 requests per minute
    errorMessage: 'Rate limit exceeded for authenticated API',
  });

export const PremiumRateLimit = () =>
  RateLimit({
    points: 300,
    duration: 60, // 300 requests per minute
    errorMessage: 'Rate limit exceeded for premium API',
  });

export const StrictRateLimit = (points: number, duration: number, blockDuration?: number) =>
  RateLimit({
    points,
    duration,
    blockDuration,
    errorMessage: `Rate limit of ${points} requests per ${duration} seconds exceeded`,
  }); 