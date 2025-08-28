import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../shared/types.js';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
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

    // Allow if user is the owner (assuming resource has createdBy field)
    const resourceId = req.params.id;
    if (resourceId && req.user.userId === resourceId) {
      return next();
    }

    const response: ApiResponse<null> = {
      success: false,
      error: 'Insufficient permissions',
    };
    return res.status(403).json(response);
  };
};
