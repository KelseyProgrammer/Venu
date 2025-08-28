import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../shared/types.js';

// Custom error class for application-specific errors
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types for better error handling
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

// Enhanced error class with error type
export class TypedAppError extends AppError {
  public errorType: ErrorType;

  constructor(message: string, statusCode: number, errorType: ErrorType, isOperational: boolean = true) {
    super(message, statusCode, isOperational);
    this.errorType = errorType;
  }
}

// Error factory functions for common errors
export const createValidationError = (message: string) => 
  new TypedAppError(message, 400, ErrorType.VALIDATION_ERROR);

export const createAuthenticationError = (message: string = 'Authentication required') => 
  new TypedAppError(message, 401, ErrorType.AUTHENTICATION_ERROR);

export const createAuthorizationError = (message: string = 'Insufficient permissions') => 
  new TypedAppError(message, 403, ErrorType.AUTHORIZATION_ERROR);

export const createNotFoundError = (message: string = 'Resource not found') => 
  new TypedAppError(message, 404, ErrorType.NOT_FOUND_ERROR);

export const createConflictError = (message: string) => 
  new TypedAppError(message, 409, ErrorType.CONFLICT_ERROR);

export const createRateLimitError = (message: string = 'Too many requests') => 
  new TypedAppError(message, 429, ErrorType.RATE_LIMIT_ERROR);

export const createDatabaseError = (message: string = 'Database operation failed') => 
  new TypedAppError(message, 500, ErrorType.DATABASE_ERROR, false);

export const createInternalServerError = (message: string = 'Internal server error') => 
  new TypedAppError(message, 500, ErrorType.INTERNAL_SERVER_ERROR, false);

// Error logging function
const logError = (error: Error, req: Request) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    userId: (req as any).user?.userId || 'anonymous'
  };

  // In production, use a proper logging service
  if (process.env.NODE_ENV === 'production') {
    console.error('Error occurred:', JSON.stringify(errorInfo, null, 2));
  } else {
    console.error('Error occurred:', errorInfo);
  }
};

// Main error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logError(error, req);

  // Handle different types of errors
  if (error instanceof TypedAppError) {
    const response: ApiResponse<null> = {
      success: false,
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { 
        errorType: error.errorType,
        stack: error.stack 
      })
    };
    return res.status(error.statusCode).json(response);
  }

  if (error instanceof AppError) {
    const response: ApiResponse<null> = {
      success: false,
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
    return res.status(error.statusCode).json(response);
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Validation failed',
      message: validationErrors.join(', ')
    };
    return res.status(400).json(response);
  }

  // Handle Mongoose duplicate key errors
  if (error.name === 'MongoError' && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyValue)[0];
    const response: ApiResponse<null> = {
      success: false,
      error: `${field} already exists`
    };
    return res.status(409).json(response);
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid token'
    };
    return res.status(401).json(response);
  }

  if (error.name === 'TokenExpiredError') {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Token expired'
    };
    return res.status(401).json(response);
  }

  // Handle generic errors
  const response: ApiResponse<null> = {
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  res.status(500).json(response);
};

// Async error wrapper to catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const response: ApiResponse<null> = {
    success: false,
    error: `Route ${req.method} ${req.path} not found`
  };
  res.status(404).json(response);
};
