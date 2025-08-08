import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';
import { ERROR_MESSAGES } from '../../utils/constants';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || ERROR_MESSAGES.INTERNAL_ERROR;
  
  logger.error('Error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    error: statusCode < 500 ? message : ERROR_MESSAGES.INTERNAL_ERROR,
    message: isDevelopment ? err.message : 'An error occurred',
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(isDevelopment && { stack: err.stack }),
  });
}

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function validationErrorHandler(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err.error?.isJoi) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request parameters',
      details: err.error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  next(err);
}