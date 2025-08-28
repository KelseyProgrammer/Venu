import { Router, Request, Response } from 'express';
import Gig from '../models/Gig.js';
import { ApiResponse } from '../shared/types.js';

const router = Router();

// Create new gig
router.post('/', async (req: Request, res: Response) => {
  try {
    const gigData = req.body;
    const gig = new Gig(gigData);
    await gig.save();

    const response: ApiResponse<any> = {
      success: true,
      data: gig,
      message: 'Gig created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create gig error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Internal server error',
    };
    res.status(500).json(response);
  }
});

// Get all gigs (with pagination and filtering)
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

// Get gigs by status - this must come before the :id route
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

// Get gigs by creator - this must come before the :id route
router.get('/by-creator/:userId', async (req: Request, res: Response) => {
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

// Get gig by ID
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

// Update gig by ID
router.put('/:id', async (req: Request, res: Response) => {
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

// Delete gig by ID
router.delete('/:id', async (req: Request, res: Response) => {
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
