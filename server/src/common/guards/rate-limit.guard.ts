import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitService } from '../services/rate-limit.service';
import { Request } from 'express';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitMetadata {
  points?: number;
  duration?: number;
  blockDuration?: number;
  errorMessage?: string;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitMetadata = this.reflector.get<RateLimitMetadata>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!rateLimitMetadata) {
      return true; // No rate limiting if no metadata
    }

    const request = context.switchToHttp().getRequest<Request>();
    const identifier = this.getIdentifier(request);

    // Check if the identifier is blocked
    const isBlocked = await this.rateLimitService.isBlocked(identifier);
    if (isBlocked) {
      throw new HttpException(
        rateLimitMetadata.errorMessage || 'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Try to consume a point
    const config = {
      points: rateLimitMetadata.points || 60,
      duration: rateLimitMetadata.duration || 60,
      blockDuration: rateLimitMetadata.blockDuration,
    };

    const allowed = await this.rateLimitService.consume(identifier, config);
    if (!allowed) {
      const remaining = await this.rateLimitService.getRemainingPoints(identifier, config);
      
      throw new HttpException({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: rateLimitMetadata.errorMessage || 'Too Many Requests',
        remainingPoints: remaining,
        retryAfter: config.duration,
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }

  private getIdentifier(request: Request): string {
    // Use API key if available
    const apiKey = request.headers['x-api-key'];
    if (apiKey) {
      return `api:${apiKey}`;
    }

    // Use user ID if authenticated
    const user = request.user as any;
    if (user?.id) {
      return `user:${user.id}`;
    }

    // Fall back to IP address
    const ip = request.ip || 
               request.connection.remoteAddress || 
               request.headers['x-forwarded-for'];
    return `ip:${ip}`;
  }
} 