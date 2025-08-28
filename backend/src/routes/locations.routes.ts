import { Router, Request, Response } from 'express';
import Location from '../models/Location.js';
import { ApiResponse } from '../shared/types.js';

const router = Router();

// Create new location
router.post('/', async (req: Request, res: Response) => {
  try {
    const locationData = req.body;
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

// Get all locations (with pagination and filtering)
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

// Search locations by area - this must come before the :id route
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

// Search locations by capacity - this must come before the :id route
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

// Get location by ID
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

// Update location by ID
router.put('/:id', async (req: Request, res: Response) => {
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

// Delete location by ID
router.delete('/:id', async (req: Request, res: Response) => {
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

export default router;
