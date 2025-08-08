import { Request, Response, NextFunction } from 'express';
import { ApiKeyModel } from '../../models/database/apiKey.model';
import logger from '../../utils/logger';
import { ERROR_MESSAGES } from '../../utils/constants';

export interface AuthenticatedRequest extends Request {
  apiKey?: any;
  apiKeyId?: number;
}

export async function authenticateAPIKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        error: ERROR_MESSAGES.INVALID_API_KEY,
        message: 'Authorization header required',
      });
      return;
    }

    const apiKey = authHeader.replace('Bearer ', '').trim();
    
    if (!apiKey) {
      res.status(401).json({
        error: ERROR_MESSAGES.INVALID_API_KEY,
        message: 'API key required',
      });
      return;
    }

    // Validate API key
    const keyData = await ApiKeyModel.findByKey(apiKey);
    
    if (!keyData || !keyData.is_active) {
      logger.warn(`Invalid API key attempt: ${apiKey.substring(0, 10)}...`);
      res.status(401).json({
        error: ERROR_MESSAGES.INVALID_API_KEY,
        message: 'Invalid or inactive API key',
      });
      return;
    }

    // Check if key has expired
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      await ApiKeyModel.deactivate(keyData.id!);
      res.status(401).json({
        error: ERROR_MESSAGES.INVALID_API_KEY,
        message: 'API key has expired',
      });
      return;
    }

    // Check usage limits
    if (keyData.current_usage >= keyData.monthly_limit) {
      res.status(429).json({
        error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        message: 'Monthly usage limit exceeded',
        limit: keyData.monthly_limit,
        current: keyData.current_usage,
      });
      return;
    }

    // Attach API key data to request
    req.apiKey = keyData;
    req.apiKeyId = keyData.id;

    // Log API usage
    logger.info(`API call authenticated for key: ${keyData.name}`);

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      message: 'Authentication failed',
    });
  }
}

export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    // No auth provided, continue without it
    next();
    return;
  }

  // If auth is provided, validate it
  authenticateAPIKey(req, res, next);
}

export function requireTier(requiredTier: 'free' | 'paid' | 'premium') {
  const tierHierarchy = { free: 0, paid: 1, premium: 2 };
  
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.apiKey) {
      res.status(401).json({
        error: ERROR_MESSAGES.INVALID_API_KEY,
        message: 'Authentication required',
      });
      return;
    }

    const userTierLevel = tierHierarchy[req.apiKey.tier as keyof typeof tierHierarchy];
    const requiredTierLevel = tierHierarchy[requiredTier];

    if (userTierLevel < requiredTierLevel) {
      res.status(403).json({
        error: 'INSUFFICIENT_TIER',
        message: `This endpoint requires ${requiredTier} tier or higher`,
        currentTier: req.apiKey.tier,
        requiredTier,
      });
      return;
    }

    next();
  };
}