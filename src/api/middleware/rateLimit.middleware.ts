import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { RATE_LIMITS, ERROR_MESSAGES } from '../../utils/constants';
import redisService from '../../services/cache/redis.service';
import logger from '../../utils/logger';

// Create rate limiter with Redis store
export function createRateLimiter(tier: 'free' | 'paid' | 'premium') {
  const limits = RATE_LIMITS[tier.toUpperCase() as keyof typeof RATE_LIMITS];
  
  return rateLimit({
    windowMs: limits.windowMs,
    max: limits.max,
    message: {
      error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      message: `Rate limit exceeded. Maximum ${limits.max} requests per hour for ${tier} tier.`,
      retryAfter: limits.windowMs / 1000,
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const authReq = req as AuthenticatedRequest;
      // Use API key ID if authenticated, otherwise use IP
      return authReq.apiKeyId 
        ? `api_key_${authReq.apiKeyId}` 
        : req.ip || 'unknown';
    },
    handler: (req: Request, res: Response) => {
      logger.warn(`Rate limit exceeded for ${req.ip}`);
      res.status(429).json({
        error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        message: `Too many requests. Please try again later.`,
      });
    },
  });
}

// Dynamic rate limiter based on user tier
export async function dynamicRateLimiter(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.apiKey) {
      // Apply strictest rate limit for unauthenticated requests
      return createRateLimiter('free')(req, res, next);
    }

    const tier = req.apiKey.tier as 'free' | 'paid' | 'premium';
    return createRateLimiter(tier)(req, res, next);
  } catch (error) {
    logger.error('Rate limiting error:', error);
    next();
  }
}

// Custom rate limiter using Redis for fine-grained control
export async function customRateLimiter(
  endpoint: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const key = req.apiKeyId 
        ? `rate:${endpoint}:${req.apiKeyId}` 
        : `rate:${endpoint}:${req.ip}`;

      // Increment counter
      const count = await redisService.increment(key);
      
      if (count === 1) {
        // First request, set expiry
        await redisService.expire(key, windowSeconds);
      }

      if (count && count > maxRequests) {
        res.status(429).json({
          error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
          message: `Rate limit exceeded for ${endpoint}`,
          limit: maxRequests,
          window: windowSeconds,
        });
        return;
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - (count || 0)).toString());
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowSeconds * 1000).toISOString());

      next();
    } catch (error) {
      logger.error('Custom rate limiter error:', error);
      // Continue on error to avoid blocking requests
      next();
    }
  };
}

// Sliding window rate limiter for more accurate limiting
export async function slidingWindowRateLimiter(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const identifier = req.apiKeyId || req.ip || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const windowStart = now - windowMs;
    
    // Create unique key for this time window
    const key = `sliding:${identifier}:${Math.floor(now / 1000)}`;
    
    // Get all keys in the window
    const pattern = `sliding:${identifier}:*`;
    const keys = await redisService.keys(pattern);
    
    // Count requests in window
    let count = 0;
    for (const k of keys) {
      const timestamp = parseInt(k.split(':')[2]) * 1000;
      if (timestamp >= windowStart) {
        const val = await redisService.get(k);
        count += parseInt(val || '0');
      }
    }

    const limit = req.apiKey 
      ? RATE_LIMITS[req.apiKey.tier.toUpperCase() as keyof typeof RATE_LIMITS].max 
      : RATE_LIMITS.FREE.max;

    if (count >= limit) {
      res.status(429).json({
        error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        message: 'Sliding window rate limit exceeded',
      });
      return;
    }

    // Increment current window counter
    await redisService.increment(key);
    await redisService.expire(key, Math.ceil(windowMs / 1000));

    next();
  } catch (error) {
    logger.error('Sliding window rate limiter error:', error);
    next();
  }
}