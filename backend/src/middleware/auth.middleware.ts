import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../shared/types.js';
import { verifyToken, JWTPayload, validateJWTConfig } from '../config/jwt.config.js';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      resource?: any;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Validate JWT configuration
  try {
    validateJWTConfig();
  } catch (error) {
    console.error('❌ CRITICAL: JWT configuration error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Server configuration error',
    };
    return res.status(500).json(response);
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Access token required',
    };
    return res.status(401).json(response);
  }

  try {
    const decoded = verifyToken(token);
    
    // Validate JWT payload structure
    if (!decoded.userId || !decoded.email || !decoded.role) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid token payload',
      };
      return res.status(403).json(response);
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid or expired token',
    };
    return res.status(403).json(response);
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Authentication required',
      };
      return res.status(401).json(response);
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Insufficient permissions',
      };
      return res.status(403).json(response);
    }

    next();
  };
};

export const requireOwnerOrRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Authentication required',
      };
      return res.status(401).json(response);
    }

    // Allow if user has required role
    if (roles.includes(req.user.role)) {
      return next();
    }

    // Allow if user is the owner (checking both direct ID match and createdBy field)
    const resourceId = req.params.id;
    if (resourceId && req.user.userId === resourceId) {
      return next();
    }

    const response: ApiResponse<null> = {
      success: false,
      error: 'Insufficient permissions - you can only access your own resources',
    };
    return res.status(403).json(response);
  };
};

// Enhanced middleware for resource ownership validation
export const requireResourceOwnership = (resourceModel: any, resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Authentication required',
      };
      return res.status(401).json(response);
    }

    try {
      const resourceId = req.params[resourceIdParam];
      if (!resourceId) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Resource ID required',
        };
        return res.status(400).json(response);
      }

      // Check if resource exists and user owns it
      const resource = await resourceModel.findById(resourceId);
      if (!resource) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Resource not found',
        };
        return res.status(404).json(response);
      }

      // Check ownership via createdBy field or direct ID match
      const isOwner = resource.createdBy?.toString() === req.user.userId || 
                     resource._id?.toString() === req.user.userId ||
                     resourceId === req.user.userId;

      if (!isOwner) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Access denied - you can only modify your own resources',
        };
        return res.status(403).json(response);
      }

      // Attach resource to request for use in route handlers
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Resource ownership validation error:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error',
      };
      return res.status(500).json(response);
    }
  };
};

// Middleware for admin-only operations
export const requireAdmin = requireRole(['admin']);

// Middleware for promoter and admin operations
export const requirePromoterOrAdmin = requireRole(['promoter', 'admin']);

// Middleware for location and admin operations  
export const requireLocationOrAdmin = requireRole(['location', 'admin']);
