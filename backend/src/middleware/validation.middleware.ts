import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ApiResponse } from '../shared/types.js';

// Generic validation middleware factory
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body, query, or params based on schema
      const validatedData = schema.parse({
        ...req.body,
        ...req.query,
        ...req.params
      });

      // Replace the original data with validated data
      req.body = validatedData;
      req.query = {};
      req.params = {};

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Validation failed',
          message: error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        };
        return res.status(400).json(response);
      }

      console.error('Validation middleware error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error'
      };
      return res.status(500).json(response);
    }
  };
};

// Specific validation middlewares for different request types
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid request body',
          message: error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        };
        return res.status(400).json(response);
      }

      console.error('Body validation error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error'
      };
      return res.status(500).json(response);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid query parameters',
          message: error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        };
        return res.status(400).json(response);
      }

      console.error('Query validation error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error'
      };
      return res.status(500).json(response);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid URL parameters',
          message: error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        };
        return res.status(400).json(response);
    }

      console.error('Params validation error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error'
      };
      return res.status(500).json(response);
    }
  };
};
