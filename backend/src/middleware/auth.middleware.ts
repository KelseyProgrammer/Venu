import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../shared/types.js';
import { verifyToken, JWTPayload, validateJWTConfig } from '../config/jwt.config.js';
import mongoose from 'mongoose';

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
    return next();
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

    return next();
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
      return next();
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

// Middleware for gig creation permissions
export const requireGigCreationPermission = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Authentication required',
    };
    return res.status(401).json(response);
  }

  try {
    const { selectedLocation } = req.body;

    // Admins can create gigs for any location
    if (req.user.role === 'admin') {
      return next();
    }

    // Validate selectedLocation is provided for non-admin users
    if (!selectedLocation) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Location must be specified for gig creation',
      };
      return res.status(400).json(response);
    }

    // Validate that selectedLocation is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(selectedLocation)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid location ID format',
      };
      return res.status(400).json(response);
    }

    // Import Location model dynamically to avoid circular dependencies
    const { default: Location } = await import('../models/Location.js');
    
    // Use lean() for better performance since we're only reading
    const location = await Location.findById(selectedLocation)
      .select('createdBy authorizedPromoters')
      .lean();
    
    if (!location) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Location not found',
      };
      return res.status(404).json(response);
    }

    // Location owners can create gigs for their own locations
    if (req.user.role === 'location') {
      if (location.createdBy.toString() === req.user.userId) {
        return next();
      }
    }

    // Promoters can create gigs for locations they're authorized for
    if (req.user.role === 'promoter') {
      // Check if promoter is authorized for this location
      const isAuthorized = location.authorizedPromoters.some(
        (promoterId: any) => promoterId.toString() === req.user!.userId
      );

      if (isAuthorized) {
        return next();
      }
    }

    const response: ApiResponse<null> = {
      success: false,
      error: 'Insufficient permissions to create gigs for this location',
    };
    return res.status(403).json(response);

  } catch (error) {
    console.error('Gig creation permission validation error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    return res.status(500).json(response);
  }
};

// Middleware for gig modification permissions
export const requireGigModificationPermission = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Authentication required',
    };
    return res.status(401).json(response);
  }

  try {
    const { id } = req.params;

    // Admins can modify any gig
    if (req.user.role === 'admin') {
      return next();
    }

    // Import models dynamically to avoid circular dependencies
    const { default: Gig } = await import('../models/Gig.js');
    const { default: Location } = await import('../models/Location.js');

    // Use lean() and select only needed fields for better performance
    const gig = await Gig.findById(id)
      .select('createdBy selectedLocation')
      .lean();
      
    if (!gig) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Gig not found',
      };
      return res.status(404).json(response);
    }

    // Gig creator can modify their own gigs
    if (gig.createdBy.toString() === req.user.userId) {
      return next();
    }

    // If gig has a location, check location-based permissions
    if (gig.selectedLocation) {
      // Use lean() and select only needed fields for better performance
      const location = await Location.findById(gig.selectedLocation)
        .select('createdBy authorizedPromoters')
        .lean();
        
      if (location) {
        // Location owners can modify gigs at their locations
        if (req.user.role === 'location' && location.createdBy.toString() === req.user.userId) {
          return next();
        }

        // Authorized promoters can modify gigs at locations they're authorized for
        if (req.user.role === 'promoter') {
          const isAuthorized = location.authorizedPromoters.some(
            (promoterId: any) => promoterId.toString() === req.user!.userId
          );
          if (isAuthorized) {
            return next();
          }
        }
      }
    }

    const response: ApiResponse<null> = {
      success: false,
      error: 'Insufficient permissions to modify this gig',
    };
    return res.status(403).json(response);

  } catch (error) {
    console.error('Gig modification permission validation error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    return res.status(500).json(response);
  }
};
