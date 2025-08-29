import { Router, Request, Response } from 'express';
import Location from '../models/Location.js';
import User from '../models/User.js';
import { ApiResponse } from '../shared/types.js';
import { 
  authenticateToken, 
  requireRole, 
  requireResourceOwnership,
  requireLocationOrAdmin 
} from '../middleware/auth.middleware.js';
import { addPromoterSchema } from '../validation/schemas.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();

// Create new location - PROTECTED ROUTE (Location owners and Admins only)
router.post('/', authenticateToken, requireLocationOrAdmin, async (req: Request, res: Response) => {
  try {
    const locationData = {
      ...req.body,
      createdBy: req.user!.userId // Ensure the creator is set from JWT
    };
    const location = new Location(locationData);
    await location.save();

    const response: ApiResponse<any> = {
      success: true,
      data: location,
      message: 'Location created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create location error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get all locations (with pagination and filtering) - PUBLIC ROUTE
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, city, state, capacity, isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter object
    const filter: any = {};
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (state) filter.state = { $regex: state, $options: 'i' };
    if (capacity) filter.capacity = { $gte: Number(capacity) };
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Get locations with pagination
    const locations = await Location.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ name: 1 });

    // Get total count for pagination
    const total = await Location.countDocuments(filter);

    const response: ApiResponse<any[]> = {
      success: true,
      data: locations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get locations error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Search locations by area - this must come before the :id route - PUBLIC ROUTE
router.get('/search/area', async (req: Request, res: Response) => {
  try {
    const { city, state, radius } = req.query;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter object for city/state search
    const filter: any = {};
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (state) filter.state = { $regex: state, $options: 'i' };
    filter.isActive = true;

    const locations = await Location.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ name: 1 });

    const total = await Location.countDocuments(filter);

    const response: ApiResponse<any[]> = {
      success: true,
      data: locations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Search locations error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Search locations by capacity - this must come before the :id route - PUBLIC ROUTE
router.get('/search/capacity', async (req: Request, res: Response) => {
  try {
    const { minCapacity, maxCapacity } = req.query;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build capacity filter
    const filter: any = { isActive: true };
    if (minCapacity && maxCapacity) {
      filter.capacity = { $gte: Number(minCapacity), $lte: Number(maxCapacity) };
    } else if (minCapacity) {
      filter.capacity = { $gte: Number(minCapacity) };
    } else if (maxCapacity) {
      filter.capacity = { $lte: Number(maxCapacity) };
    }

    const locations = await Location.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ capacity: 1 });

    const total = await Location.countDocuments(filter);

    const response: ApiResponse<any[]> = {
      success: true,
      data: locations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Search locations by capacity error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get location by ID - PUBLIC ROUTE
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const location = await Location.findById(id)
      .populate('createdBy', 'firstName lastName email phone');

    if (!location) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Location not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: location,
    };

    res.json(response);
  } catch (error) {
    console.error('Get location error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Update location by ID - PROTECTED ROUTE (Owner or Admin only)
router.put('/:id', authenticateToken, requireResourceOwnership(Location), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const location = await Location.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!location) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Location not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: location,
      message: 'Location updated successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Update location error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Delete location by ID - PROTECTED ROUTE (Owner or Admin only)
router.delete('/:id', authenticateToken, requireResourceOwnership(Location), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const location = await Location.findByIdAndDelete(id);

    if (!location) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Location not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'Location deleted successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Delete location error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Add promoter to location - PROTECTED ROUTE (Location owner or Admin only)
router.post('/:id/promoters', authenticateToken, requireResourceOwnership(Location), validateBody(addPromoterSchema), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { promoterId } = req.body;

    if (!promoterId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Promoter ID is required',
      };
      return res.status(400).json(response);
    }

    // Execute queries in parallel for better performance
    const [promoter, location] = await Promise.all([
      User.findById(promoterId).select('role').lean(),
      Location.findById(id).select('authorizedPromoters').lean()
    ]);

    if (!promoter) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Promoter not found',
      };
      return res.status(404).json(response);
    }

    if (promoter.role !== 'promoter') {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User is not a promoter',
      };
      return res.status(400).json(response);
    }

    if (!location) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Location not found',
      };
      return res.status(404).json(response);
    }

    // Check if promoter is already authorized
    const isAlreadyAuthorized = location.authorizedPromoters.some(
      (existingId: any) => existingId.toString() === promoterId
    );

    if (isAlreadyAuthorized) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Promoter is already authorized for this location',
      };
      return res.status(400).json(response);
    }

    // Add promoter to location
    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      { $addToSet: { authorizedPromoters: promoterId } },
      { new: true, runValidators: true }
    ).populate('authorizedPromoters', 'firstName lastName email role');

    const response: ApiResponse<any> = {
      success: true,
      data: updatedLocation,
      message: 'Promoter added successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Add promoter error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Remove promoter from location - PROTECTED ROUTE (Location owner or Admin only)
router.delete('/:id/promoters/:promoterId', authenticateToken, requireResourceOwnership(Location), async (req: Request, res: Response) => {
  try {
    const { id, promoterId } = req.params;

    const location = await Location.findByIdAndUpdate(
      id,
      { $pull: { authorizedPromoters: promoterId } },
      { new: true, runValidators: true }
    ).populate('authorizedPromoters', 'firstName lastName email role');

    if (!location) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Location not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: location,
      message: 'Promoter removed successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Remove promoter error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get authorized promoters for location - PROTECTED ROUTE (Location owner or Admin only)
router.get('/:id/promoters', authenticateToken, requireResourceOwnership(Location), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Use lean() for better performance since we're only reading
    const location = await Location.findById(id)
      .populate('authorizedPromoters', 'firstName lastName email role phone')
      .select('authorizedPromoters')
      .lean();

    if (!location) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Location not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: location.authorizedPromoters || [],
    };

    res.json(response);
  } catch (error) {
    console.error('Get promoters error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

export default router;
