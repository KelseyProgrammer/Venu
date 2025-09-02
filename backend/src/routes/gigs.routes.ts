import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Gig from '../models/Gig.js';
import { ApiResponse } from '../shared/types.js';
import { 
  authenticateToken, 
  requireRole, 
  requireResourceOwnership,
  requirePromoterOrAdmin,
  requireGigCreationPermission,
  requireGigModificationPermission
} from '../middleware/auth.middleware.js';

const router = Router();

// Create new gig - PROTECTED ROUTE (Location owners, authorized promoters, and Admins only)
router.post('/', authenticateToken, requireGigCreationPermission, async (req: Request, res: Response) => {
  try {

    console.log('User:', req.user);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Convert string IDs to ObjectIds for MongoDB references
    const gigData = {
      ...req.body,
      createdBy: req.user!.userId,
      selectedLocation: req.body.selectedLocation ? new mongoose.Types.ObjectId(req.body.selectedLocation) : undefined,
      selectedPromoter: req.body.selectedPromoter ? new mongoose.Types.ObjectId(req.body.selectedPromoter) : undefined,
      // Only convert selectedDoorPerson to ObjectId if it's a valid MongoDB ObjectId (not "self" or empty)
      selectedDoorPerson: req.body.selectedDoorPerson && 
                         req.body.selectedDoorPerson !== "self" && 
                         req.body.selectedDoorPerson !== "" && 
                         mongoose.Types.ObjectId.isValid(req.body.selectedDoorPerson) ? 
                         new mongoose.Types.ObjectId(req.body.selectedDoorPerson) : undefined,
    };
    
    console.log('Processed gig data:', JSON.stringify(gigData, null, 2));
    
    const gig = new Gig(gigData);
    console.log('Gig model created, attempting to save...');
    await gig.save();
    console.log('Gig saved successfully!');

    const response: ApiResponse<any> = {
      success: true,
      data: gig,
      message: 'Gig created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('=== GIG CREATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);
    
    // Provide more specific error messages based on error type
    let errorMessage = 'Internal server error';
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + error.message;
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid data format: ' + error.message;
    } else if (error.name === 'BSONError') {
      errorMessage = 'Invalid ID format: ' + error.message;
    } else if (error.name === 'MongoError' && error.code === 11000) {
      errorMessage = 'Duplicate entry found';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
    };
    res.status(500).json(response);
  }
});

// Get all gigs (with pagination and filtering) - PUBLIC ROUTE
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, genre, location, promoter } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter object
    const filter: any = {};
    if (status) filter.status = status;
    if (genre) filter.eventGenre = genre;
    if (location) filter.selectedLocation = location;
    if (promoter) filter.selectedPromoter = promoter;

    // Get gigs with pagination
    const gigs = await Gig.find(filter)
      .populate('selectedLocation', 'name city state')
      .populate('selectedPromoter', 'firstName lastName email')
      .populate('selectedDoorPerson', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ eventDate: 1 });

    // Get total count for pagination
    const total = await Gig.countDocuments(filter);

    const response: ApiResponse<any[]> = {
      success: true,
      data: gigs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get gigs error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get gigs by status - this must come before the :id route - PUBLIC ROUTE
router.get('/by-status/:status', async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const gigs = await Gig.find({ status })
      .populate('selectedLocation', 'name city state')
      .populate('selectedPromoter', 'firstName lastName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ eventDate: 1 });

    const total = await Gig.countDocuments({ status });

    const response: ApiResponse<any[]> = {
      success: true,
      data: gigs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get gigs by status error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get gigs by creator - this must come before the :id route - PROTECTED ROUTE
router.get('/by-creator/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const gigs = await Gig.find({ createdBy: userId })
      .populate('selectedLocation', 'name city state')
      .populate('selectedPromoter', 'firstName lastName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ eventDate: 1 });

    const total = await Gig.countDocuments({ createdBy: userId });

    const response: ApiResponse<any[]> = {
      success: true,
      data: gigs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get gigs by creator error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get gig by ID - PUBLIC ROUTE
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gig = await Gig.findById(id)
      .populate('selectedLocation', 'name city state address')
      .populate('selectedPromoter', 'firstName lastName email phone')
      .populate('selectedDoorPerson', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName email');

    if (!gig) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Gig not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: gig,
    };

    res.json(response);
  } catch (error) {
    console.error('Get gig error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Update gig by ID - PROTECTED ROUTE (Gig creator, location owner, authorized promoter, or Admin only)
router.put('/:id', authenticateToken, requireGigModificationPermission, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const gig = await Gig.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('selectedLocation selectedPromoter selectedDoorPerson createdBy');

    if (!gig) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Gig not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: gig,
      message: 'Gig updated successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Update gig error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Delete gig by ID - PROTECTED ROUTE (Gig creator, location owner, authorized promoter, or Admin only)
router.delete('/:id', authenticateToken, requireGigModificationPermission, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gig = await Gig.findByIdAndDelete(id);

    if (!gig) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Gig not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'Gig deleted successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Delete gig error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

export default router;
